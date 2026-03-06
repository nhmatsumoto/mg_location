import csv
import io
import json
import logging
import uuid
from datetime import datetime, timezone

from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from apps.api.models import AttentionAlert, CollapseReport, DisasterEvent, MapAnnotation, MissingPerson, RescueGroup, SupplyLogistics
from apps.api.serializers import (
    RescueGroupSerializer,
    RiskAreaSerializer,
    SupplyLogisticsSerializer,
    SupportPointSerializer,
)
from apps.api.services.climate import climate_integrations_context
from apps.api.services.simulation.logic import (
    build_rain_timeline, event_to_map_risk_area, load_hotspots_from_risk_areas
)
from .core import _parse_float, _request_payload, _json_error

logger = logging.getLogger(__name__)

# State
DEVICE_SUBSCRIPTIONS = []
RELATIVE_PHOTO_FEATURES = [
    {
        'id': 'VJ-901',
        'name': 'João Silva (Simulação)',
        'faceEmbedding': [0.12, 0.45, 0.78, 0.22],
        'notes': 'Visto pela última vez perto da ponte central.',
    },
    {
        'id': 'VJ-902',
        'name': 'Maria Oliveira (Simulação)',
        'faceEmbedding': [0.88, 0.11, 0.34, 0.56],
        'notes': 'Traje azul, carregava mochila preta.',
    }
]
SEARCHED_AREAS = []
MISSING_REPORTS = []
MISSING_PEOPLE = []
FLOW_PATHS = [
    {
        'id': 'FP-001',
        'name': 'Escoamento principal setor leste',
        'coordinates': [
            {'lat': -21.1215, 'lng': -42.9427},
            {'lat': -21.1202, 'lng': -42.9409},
            {'lat': -21.1187, 'lng': -42.9388},
            {'lat': -21.1171, 'lng': -42.9365},
        ],
    }
]

# Helpers
def _euclidean_distance(v1, v2):
    if not v1 or not v2 or len(v1) != len(v2):
        return None
    return sum((a - b)**2 for a, b in zip(v1, v2))**0.5


def _attention_alert_to_dict(alert):
    return {
        'id': alert.external_id,
        'title': alert.title,
        'message': alert.message,
        'severity': alert.severity,
        'lat': alert.lat,
        'lng': alert.lng,
        'radiusMeters': alert.radius_meters,
        'createdAtUtc': alert.created_at.isoformat(),
    }


def _missing_person_to_dict(person):
    return {
        'id': person.external_id,
        'personName': person.person_name,
        'age': person.age,
        'city': person.city,
        'lastSeenLocation': person.last_seen_location,
        'lat': person.lat,
        'lng': person.lng,
        'physicalDescription': person.physical_description,
        'additionalInfo': person.additional_info,
        'contactName': person.contact_name,
        'contactPhone': person.contact_phone,
        'source': person.source,
        'createdAtUtc': person.created_at.isoformat(),
    }


def _payload_with_request_id(request):
    payload = _request_payload(request)
    requested_id = request.GET.get('id') or payload.get('id')
    return payload, requested_id


def _find_annotation_or_404(external_id, record_type):
    try:
        return MapAnnotation.objects.get(external_id=external_id, record_type=record_type)
    except MapAnnotation.DoesNotExist:
        return None


def _annotation_to_dict(annotation):
    return {
        'id': annotation.external_id,
        'recordType': annotation.record_type,
        'title': annotation.title,
        'lat': annotation.lat,
        'lng': annotation.lng,
        'severity': annotation.severity,
        'radiusMeters': annotation.radius_meters,
        'status': annotation.status,
        'metadata': annotation.metadata or {},
        'createdAtUtc': annotation.created_at.isoformat(),
    }


def _rescue_group_to_dict(group):
    return {
        'id': group.external_id,
        'name': group.name,
        'members': group.members,
        'specialty': group.specialty,
        'status': group.status,
        'lat': group.lat,
        'lng': group.lng,
        'createdAtUtc': group.created_at.isoformat(),
    }


def _supply_to_dict(item):
    return {
        'id': item.external_id,
        'item': item.item,
        'quantity': item.quantity,
        'unit': item.unit,
        'origin': item.origin,
        'destination': item.destination,
        'status': item.status,
        'priority': item.priority,
        'createdAtUtc': item.created_at.isoformat(),
    }

# Views
@csrf_exempt
def push_register(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = _request_payload(request)
    device_id = payload.get('deviceId')
    token = payload.get('token')

    if not device_id or not token:
        return _json_error('deviceId e token são obrigatórios.')

    record = {
        'id': 'SUB-{}'.format(uuid.uuid4().hex[:8]),
        'deviceId': device_id,
        'token': token,
        'platform': payload.get('platform') or 'unknown',
        'topics': payload.get('topics') or ['attention-alerts'],
        'registeredAtUtc': datetime.now(timezone.utc).isoformat(),
    }

    DEVICE_SUBSCRIPTIONS[:] = [sub for sub in DEVICE_SUBSCRIPTIONS if sub['deviceId'] != device_id]
    DEVICE_SUBSCRIPTIONS.append(record)
    return JsonResponse(record, status=201)


def attention_alerts(request):
    if request.method == 'GET':
        alerts = [_attention_alert_to_dict(item) for item in AttentionAlert.objects.order_by('-created_at')[:500]]
        return JsonResponse(alerts, safe=False)

    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = _request_payload(request)
    title = payload.get('title')
    message = payload.get('message')
    lat = _parse_float(payload.get('lat'))
    lng = _parse_float(payload.get('lng'))

    if not title or not message or lat is None or lng is None:
        return _json_error('title, message, lat e lng são obrigatórios.')

    alert = AttentionAlert.objects.create(
        external_id='AL-{}'.format(uuid.uuid4().hex[:8]),
        title=title,
        message=message,
        severity=payload.get('severity') or 'medium',
        lat=lat,
        lng=lng,
        radius_meters=int(payload.get('radiusMeters') or 500),
    )

    return JsonResponse({
        'alert': _attention_alert_to_dict(alert),
        'registeredDevices': len(DEVICE_SUBSCRIPTIONS),
        'delivery': 'Simulação local: envio via provedor push externo (FCM/APNs).',
    }, status=201)


def missing_persons(request):
    if request.method == 'GET':
        people = [_missing_person_to_dict(item) for item in MissingPerson.objects.order_by('-created_at')[:1000]]
        return JsonResponse(people, safe=False)

    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = _request_payload(request)
    person_name = (payload.get('personName') or payload.get('name') or '').strip()
    city = (payload.get('city') or 'Não informado').strip()
    last_seen = (payload.get('lastSeenLocation') or payload.get('lastSeen') or '').strip()
    contact_name = (payload.get('contactName') or 'Central MG Location').strip()
    contact_phone = (payload.get('contactPhone') or 'Não informado').strip()
    lat = _parse_float(payload.get('lat'))
    lng = _parse_float(payload.get('lng'))

    if not person_name or not last_seen:
        return _json_error('personName (ou name) e lastSeenLocation (ou lastSeen) são obrigatórios.')

    age_raw = payload.get('age')
    age = None
    if age_raw not in (None, ''):
        try:
            age = int(age_raw)
        except (TypeError, ValueError):
            return _json_error('age deve ser numérico quando informado.')

    person = MissingPerson.objects.create(
        external_id='MP-{}'.format(uuid.uuid4().hex[:8]),
        person_name=person_name,
        age=age,
        city=city,
        last_seen_location=last_seen,
        lat=lat,
        lng=lng,
        physical_description=payload.get('physicalDescription') or '',
        additional_info=payload.get('additionalInfo') or '',
        contact_name=contact_name,
        contact_phone=contact_phone,
        source=payload.get('source') or 'manual-platform',
    )

    return JsonResponse(_missing_person_to_dict(person), status=201)


def missing_people_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="missing_people_mg.csv"'
    writer = csv.writer(response)
    writer.writerow(['ID', 'Nome', 'Idade', 'Cidade', 'UltimaVezVisto', 'Latitude', 'Longitude'])
    for p in MissingPerson.objects.all():
        writer.writerow([p.external_id, p.person_name, p.age, p.city, p.last_seen_location, p.lat, p.lng])
    return response


def map_annotations(request):
    if request.method == 'GET':
        rows = [_annotation_to_dict(a) for a in MapAnnotation.objects.order_by('-created_at')[:1000]]
        return JsonResponse(rows, safe=False)

    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = _request_payload(request)
    record_type = (payload.get('recordType') or payload.get('type') or '').strip()
    title = (payload.get('title') or '').strip()
    lat = _parse_float(payload.get('lat'))
    lng = _parse_float(payload.get('lng'))

    if record_type not in [MapAnnotation.TYPE_SUPPORT_POINT, MapAnnotation.TYPE_RISK_AREA, MapAnnotation.TYPE_MISSING_PERSON]:
        return _json_error('recordType inválido. Use support_point, risk_area ou missing_person.')

    if lat is None or lng is None:
        return _json_error('lat e lng são obrigatórios.')

    if not title:
        title = {
            MapAnnotation.TYPE_SUPPORT_POINT: 'Ponto de apoio',
            MapAnnotation.TYPE_RISK_AREA: 'Área de risco',
            MapAnnotation.TYPE_MISSING_PERSON: 'Registro de desaparecido',
        }[record_type]

    metadata = payload.get('metadata') if isinstance(payload.get('metadata'), dict) else {}

    if record_type == MapAnnotation.TYPE_MISSING_PERSON:
        person_name = (payload.get('personName') or title).strip()
        last_seen = (payload.get('lastSeenLocation') or payload.get('lastSeen') or 'Ponto selecionado no mapa').strip()
        person = MissingPerson.objects.create(
            external_id='MP-{}'.format(uuid.uuid4().hex[:8]),
            person_name=person_name,
            age=int(payload.get('age') or 0) or None,
            city=(payload.get('city') or 'Não informado').strip(),
            last_seen_location=last_seen,
            lat=lat,
            lng=lng,
            physical_description=payload.get('physicalDescription') or '',
            additional_info=payload.get('additionalInfo') or '',
            contact_name=(payload.get('contactName') or 'Central MG Location').strip(),
            contact_phone=(payload.get('contactPhone') or 'Não informado').strip(),
            source='map-one-click',
        )
        metadata = {**metadata, 'missingPersonId': person.external_id}

    annotation = MapAnnotation.objects.create(
        external_id='MA-{}'.format(uuid.uuid4().hex[:8]),
        record_type=record_type,
        title=title,
        lat=lat,
        lng=lng,
        severity=(payload.get('severity') or '').strip(),
        radius_meters=int(payload.get('radiusMeters') or 0) or None,
        status=(payload.get('status') or 'active').strip(),
        metadata=metadata,
    )

    return JsonResponse(_annotation_to_dict(annotation), status=201)


def support_points(request):
    if request.method == 'GET':
        requested_id = request.GET.get('id')
        if requested_id:
            annotation = _find_annotation_or_404(requested_id, MapAnnotation.TYPE_SUPPORT_POINT)
            if not annotation:
                return _json_error('Ponto de apoio não encontrado.', 404)
            return JsonResponse(_annotation_to_dict(annotation))
        rows = [_annotation_to_dict(a) for a in MapAnnotation.objects.filter(record_type=MapAnnotation.TYPE_SUPPORT_POINT).order_by('-created_at')[:500]]
        return JsonResponse(rows, safe=False)

    payload, requested_id = _payload_with_request_id(request)

    if request.method == 'POST':
        serializer = SupportPointSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        annotation = MapAnnotation.objects.create(
            external_id='MA-{}'.format(uuid.uuid4().hex[:8]),
            record_type=MapAnnotation.TYPE_SUPPORT_POINT,
            title=data.get('name') or 'Ponto de apoio',
            lat=data['lat'],
            lng=data['lng'],
            status=data.get('status') or 'active',
            metadata={'type': data.get('type') or 'apoio', 'capacity': data.get('capacity', 0)},
        )
        return JsonResponse(_annotation_to_dict(annotation), status=201)

    if request.method == 'PUT':
        if not requested_id:
            return _json_error('id é obrigatório para atualização.', 400)
        annotation = _find_annotation_or_404(requested_id, MapAnnotation.TYPE_SUPPORT_POINT)
        if not annotation:
            return _json_error('Ponto de apoio não encontrado.', 404)
        serializer = SupportPointSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        annotation.title = data.get('name') or annotation.title
        annotation.lat = data['lat']
        annotation.lng = data['lng']
        annotation.status = data.get('status') or annotation.status
        annotation.metadata = {'type': data.get('type') or 'apoio', 'capacity': data.get('capacity', 0)}
        annotation.save(update_fields=['title', 'lat', 'lng', 'status', 'metadata', 'updated_at'])
        return JsonResponse(_annotation_to_dict(annotation))

    if request.method == 'DELETE':
        if not requested_id:
            return _json_error('id é obrigatório para remoção.', 400)
        annotation = _find_annotation_or_404(requested_id, MapAnnotation.TYPE_SUPPORT_POINT)
        if not annotation:
            return _json_error('Ponto de apoio não encontrado.', 404)
        annotation.delete()
        return JsonResponse({'deleted': True, 'id': requested_id})

    return HttpResponse(status=405)


def risk_areas(request):
    if request.method == 'GET':
        requested_id = request.GET.get('id')
        if requested_id:
            annotation = _find_annotation_or_404(requested_id, MapAnnotation.TYPE_RISK_AREA)
            if not annotation:
                return _json_error('Área de risco não encontrada.', 404)
            return JsonResponse(_annotation_to_dict(annotation))
        rows = [_annotation_to_dict(a) for a in MapAnnotation.objects.filter(record_type=MapAnnotation.TYPE_RISK_AREA).order_by('-created_at')[:500]]
        return JsonResponse(rows, safe=False)

    payload, requested_id = _payload_with_request_id(request)

    if request.method == 'POST':
        serializer = RiskAreaSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        annotation = MapAnnotation.objects.create(
            external_id='MA-{}'.format(uuid.uuid4().hex[:8]),
            record_type=MapAnnotation.TYPE_RISK_AREA,
            title=data.get('name') or 'Área de risco',
            lat=data['lat'],
            lng=data['lng'],
            severity=data.get('severity') or 'high',
            radius_meters=data.get('radiusMeters') or 500,
            status=data.get('status') or 'active',
            metadata={'notes': data.get('notes') or ''},
        )
        return JsonResponse(_annotation_to_dict(annotation), status=201)

    if request.method == 'PUT':
        if not requested_id:
            return _json_error('id é obrigatório para atualização.', 400)
        annotation = _find_annotation_or_404(requested_id, MapAnnotation.TYPE_RISK_AREA)
        if not annotation:
            return _json_error('Área de risco não encontrada.', 404)
        serializer = RiskAreaSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        annotation.title = data.get('name') or annotation.title
        annotation.lat = data['lat']
        annotation.lng = data['lng']
        annotation.severity = data.get('severity') or annotation.severity
        annotation.radius_meters = data.get('radiusMeters') or annotation.radius_meters
        annotation.status = data.get('status') or annotation.status
        annotation.metadata = {'notes': data.get('notes') or ''}
        annotation.save(update_fields=['title', 'lat', 'lng', 'severity', 'radius_meters', 'status', 'metadata', 'updated_at'])
        return JsonResponse(_annotation_to_dict(annotation))

    if request.method == 'DELETE':
        if not requested_id:
            return _json_error('id é obrigatório para remoção.', 400)
        annotation = _find_annotation_or_404(requested_id, MapAnnotation.TYPE_RISK_AREA)
        if not annotation:
            return _json_error('Área de risco não encontrada.', 404)
        annotation.delete()
        return JsonResponse({'deleted': True, 'id': requested_id})

    return HttpResponse(status=405)


def rescue_groups(request):
    if request.method == 'GET':
        requested_id = request.GET.get('id')
        if requested_id:
            try:
                group = RescueGroup.objects.get(external_id=requested_id)
            except RescueGroup.DoesNotExist:
                return _json_error('Grupo de resgate não encontrado.', 404)
            return JsonResponse(_rescue_group_to_dict(group))
        rows = [_rescue_group_to_dict(g) for g in RescueGroup.objects.order_by('-created_at')[:500]]
        return JsonResponse(rows, safe=False)

    payload, requested_id = _payload_with_request_id(request)

    if request.method == 'POST':
        serializer = RescueGroupSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        group = RescueGroup.objects.create(
            external_id='RG-{}'.format(uuid.uuid4().hex[:8]),
            name=data['name'].strip(),
            members=data.get('members', 0),
            specialty=data.get('specialty') or 'generalista',
            status=data.get('status') or 'pronto',
            lat=data.get('lat'),
            lng=data.get('lng'),
        )
        return JsonResponse(_rescue_group_to_dict(group), status=201)

    if request.method == 'PUT':
        if not requested_id:
            return _json_error('id é obrigatório para atualização.', 400)
        try:
            group = RescueGroup.objects.get(external_id=requested_id)
        except RescueGroup.DoesNotExist:
            return _json_error('Grupo de resgate não encontrado.', 404)
        serializer = RescueGroupSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        group.name = data['name'].strip()
        group.members = data.get('members', 0)
        group.specialty = data.get('specialty') or 'generalista'
        group.status = data.get('status') or 'pronto'
        group.lat = data.get('lat')
        group.lng = data.get('lng')
        group.save(update_fields=['name', 'members', 'specialty', 'status', 'lat', 'lng', 'updated_at'])
        return JsonResponse(_rescue_group_to_dict(group))

    if request.method == 'DELETE':
        if not requested_id:
            return _json_error('id é obrigatório para remoção.', 400)
        deleted, _ = RescueGroup.objects.filter(external_id=requested_id).delete()
        if not deleted:
            return _json_error('Grupo de resgate não encontrado.', 404)
        return JsonResponse({'deleted': True, 'id': requested_id})

    return HttpResponse(status=405)


def supply_logistics(request):
    if request.method == 'GET':
        requested_id = request.GET.get('id')
        if requested_id:
            try:
                row = SupplyLogistics.objects.get(external_id=requested_id)
            except SupplyLogistics.DoesNotExist:
                return _json_error('Registro de logística não encontrado.', 404)
            return JsonResponse(_supply_to_dict(row))
        rows = [_supply_to_dict(s) for s in SupplyLogistics.objects.order_by('-created_at')[:500]]
        return JsonResponse(rows, safe=False)

    payload, requested_id = _payload_with_request_id(request)

    if request.method == 'POST':
        serializer = SupplyLogisticsSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        supply = SupplyLogistics.objects.create(
            external_id='LG-{}'.format(uuid.uuid4().hex[:8]),
            item=data['item'].strip(),
            quantity=data['quantity'],
            unit=data.get('unit') or 'un',
            origin=data.get('origin') or 'Não informado',
            destination=data.get('destination') or 'Não informado',
            status=data.get('status') or 'planejado',
            priority=data.get('priority') or 'media',
        )
        return JsonResponse(_supply_to_dict(supply), status=201)

    if request.method == 'PUT':
        if not requested_id:
            return _json_error('id é obrigatório para atualização.', 400)
        try:
            supply = SupplyLogistics.objects.get(external_id=requested_id)
        except SupplyLogistics.DoesNotExist:
            return _json_error('Registro de logística não encontrado.', 404)
        serializer = SupplyLogisticsSerializer(data=payload)
        if not serializer.is_valid():
            return JsonResponse({'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        supply.item = data['item'].strip()
        supply.quantity = data['quantity']
        supply.unit = data.get('unit') or 'un'
        supply.origin = data.get('origin') or 'Não informado'
        supply.destination = data.get('destination') or 'Não informado'
        supply.status = data.get('status') or 'planejado'
        supply.priority = data.get('priority') or 'media'
        supply.save(update_fields=['item', 'quantity', 'unit', 'origin', 'destination', 'status', 'priority', 'updated_at'])
        return JsonResponse(_supply_to_dict(supply))

    if request.method == 'DELETE':
        if not requested_id:
            return _json_error('id é obrigatório para remoção.', 400)
        deleted, _ = SupplyLogistics.objects.filter(external_id=requested_id).delete()
        if not deleted:
            return _json_error('Registro de logística não encontrado.', 404)
        return JsonResponse({'deleted': True, 'id': requested_id})

    return HttpResponse(status=405)


def operations_snapshot(request):
    if request.method != 'GET':
        return HttpResponse(status=405)

    support_points_rows = [_annotation_to_dict(a) for a in MapAnnotation.objects.filter(record_type=MapAnnotation.TYPE_SUPPORT_POINT).order_by('-created_at')[:500]]
    risk_area_rows = [_annotation_to_dict(a) for a in MapAnnotation.objects.filter(record_type=MapAnnotation.TYPE_RISK_AREA).order_by('-created_at')[:500]]
    crawler_rain_events = DisasterEvent.objects.filter(event_type__in=['Flood', 'Storm', 'Landslide']).order_by('-start_at')[:200]
    crawler_risk_areas = [event_to_map_risk_area(event) for event in crawler_rain_events]
    combined_risk_areas = (risk_area_rows + crawler_risk_areas)[:700]
    rescue_group_rows = [_rescue_group_to_dict(g) for g in RescueGroup.objects.order_by('-created_at')[:500]]
    supply_rows = [_supply_to_dict(s) for s in SupplyLogistics.objects.order_by('-created_at')[:500]]

    climate = climate_integrations_context(-21.1207, -42.9359)
    weather = climate.get('summary') or {}
    rain_mm_24h = weather.get('rainfallMm24h') if isinstance(weather.get('rainfallMm24h'), (int, float)) else 0
    critical_risk = len([a for a in risk_area_rows if a.get('severity') in ['critical', 'high']])

    payload = {
        'generatedAtUtc': datetime.now(timezone.utc).isoformat(),
        'kpis': {
            'criticalAlerts': critical_risk + len([e for e in crawler_rain_events if e.severity >= 4]),
            'activeTeams': len([g for g in rescue_group_rows if g.get('status') in ['em_campo', 'pronto']]),
            'rain24hMm': rain_mm_24h,
            'suppliesInTransit': len([s for s in supply_rows if s.get('status') == 'em_transporte']),
        },
        'layers': {
            'supportPoints': support_points_rows,
            'riskAreas': combined_risk_areas,
            'rescueGroups': rescue_group_rows,
            'flowPaths': FLOW_PATHS,
            'missingPersons': [_missing_person_to_dict(item) for item in MissingPerson.objects.order_by('-created_at')[:500]],
            'hotspots': sorted(load_hotspots_from_risk_areas(), key=lambda h: h.get('score', 0), reverse=True),
            'timeline': build_rain_timeline(),
        },
        'weather': {
            'summary': 'Clima integrado (Open-Meteo + MET Norway): chuva acumulada, previsão e risco de tempestade.',
            'rain24hMm': rain_mm_24h,
            'rainNext24hMm': weather.get('rainfallNext24hMm') or 0,
            'stormRisk': weather.get('stormRisk') or 'unknown',
            'windGustKmh': weather.get('windGustKmh'),
            'soilSaturation': 'N/D',
            'providers': climate.get('providers', []),
        },
        'logistics': supply_rows,
    }

    return JsonResponse(payload, safe=False)


def gee_analysis(request):
    bbox = request.GET.get('bbox')
    analysis_type = request.GET.get('analysisType', 'ndvi')
    
    if not bbox:
        return _json_error('bbox é obrigatório format: minLat,minLon,maxLat,maxLon')
    
    try:
        parts = [float(x) for x in bbox.split(',')]
        if len(parts) != 4: raise ValueError()
    except:
        return _json_error('bbox inválido.')

    grid = []
    import random
    random.seed(bbox + analysis_type)
    
    for i in range(10):
        row = []
        for j in range(10):
            val = random.random()
            if analysis_type == 'ndvi':
                val = 0.3 + (val * 0.6)
            elif analysis_type == 'moisture':
                val = random.uniform(0, 100)
            row.append(round(val, 3))
        grid.append(row)

    return JsonResponse({
        'source': 'Google Earth Engine (Bridge)',
        'type': analysis_type,
        'bbox': bbox,
        'resolution': '30m',
        'timestamp': '2026-03-06T18:30:00Z',
        'data': grid
    })


@csrf_exempt
def searched_areas(request):
    if request.method == 'GET':
        return JsonResponse(sorted(SEARCHED_AREAS, key=lambda a: a['searchedAtUtc'], reverse=True), safe=False)

    if request.method != 'POST':
        return HttpResponse(status=405)

    area_name = request.POST.get('areaName')
    team = request.POST.get('team')
    lat = _parse_float(request.POST.get('lat'))
    lng = _parse_float(request.POST.get('lng'))

    if not area_name or not team or lat is None or lng is None:
        return _json_error('areaName, team, lat e lng são obrigatórios.')

    payload = {
        'id': 'SA-{}'.format(uuid.uuid4().hex[:8]),
        'areaName': area_name,
        'team': team,
        'lat': lat,
        'lng': lng,
        'notes': request.POST.get('notes') or '',
        'searchedAtUtc': datetime.now(timezone.utc).isoformat(),
    }
    SEARCHED_AREAS.append(payload)
    return JsonResponse(payload, status=201)


@csrf_exempt
def report_info(request):
    if request.method == 'GET':
        return JsonResponse(sorted(MISSING_REPORTS, key=lambda r: r['reportedAtUtc'], reverse=True), safe=False)

    if request.method != 'POST':
        return HttpResponse(status=405)

    data = _request_payload(request)
    kind = (data.get('kind') or 'person').lower()
    name = data.get('name')
    last_seen = data.get('lastSeen')
    lat = _parse_float(data.get('lat'))
    lng = _parse_float(data.get('lng'))

    if kind not in ['person', 'animal']:
        return _json_error('kind deve ser person ou animal.')
    if not name or not last_seen:
        return _json_error('name e lastSeen são obrigatórios.')

    payload = {
        'id': 'RI-{}'.format(uuid.uuid4().hex[:8]),
        'kind': kind,
        'name': name,
        'lastSeen': last_seen,
        'lat': lat,
        'lng': lng,
        'contact': data.get('contact') or '',
        'details': data.get('details') or '',
        'reportedAtUtc': datetime.now(timezone.utc).isoformat(),
    }
    MISSING_REPORTS.append(payload)

    MISSING_PEOPLE.append(
        {
            'name': name,
            'age': int(data.get('age') or 0),
            'category': kind,
            'lastSeen': last_seen,
            'status': 'missing',
        }
    )

    return JsonResponse(payload, status=201)


@csrf_exempt
def identify_victim(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    embedding_raw = request.POST.get('embedding')
    if not embedding_raw:
        return _json_error('embedding é obrigatório. Ex: "0.1,0.2,0.3,0.4"')

    try:
        embedding = [float(value.strip()) for value in embedding_raw.split(',') if value.strip()]
    except ValueError:
        return _json_error('embedding inválido, use números separados por vírgula.')

    ranked = []
    for candidate in RELATIVE_PHOTO_FEATURES:
        distance = _euclidean_distance(embedding, candidate['faceEmbedding'])
        if distance is None:
            continue
        confidence = max(0.0, 1.0 - min(distance, 1.0))
        ranked.append(
            {
                'victimId': candidate['id'],
                'name': candidate['name'],
                'confidence': round(confidence, 3),
                'notes': candidate['notes'],
            }
        )

    ranked = sorted(ranked, key=lambda item: item['confidence'], reverse=True)

    return JsonResponse(
        {
            'queryEmbeddingDimension': len(embedding),
            'topMatches': ranked[:3],
            'disclaimer': 'Matching simplificado para triagem inicial. Exige validação humana e pericial.',
        },
        safe=False,
    )

import json
import logging
import os
import uuid
from datetime import datetime, timezone

from django.db import transaction
from django.http import HttpResponse, JsonResponse, StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from werkzeug.utils import secure_filename

from apps.api.models import SimulationArea, ScenarioBundle, SimulationRun, CollapseReport, AttentionAlert
from apps.api.serializers_simulation import SimulationAreaSerializer, ScenarioBundleSerializer, SimulationRunSerializer
from .services.simulation.logic import (
    build_rescue_support, simulate_tailing_flow, load_hotspots_from_risk_areas
)
from .services.terrain import terrain_open_data_context
from .core import _parse_float, _request_payload, _json_error, _uploads_directory

logger = logging.getLogger(__name__)

# State
SPLAT_JOBS = []

# ViewSets
class SimulationAreaViewSet(viewsets.ModelViewSet):
    # ... (existing content)
    queryset = SimulationArea.objects.all().order_by('-created_at')
    serializer_class = SimulationAreaSerializer

    @action(detail=True, methods=['post'])
    def build_scenario(self, request, pk=None):
        area = self.get_object()
        # Create a pending scenario bundle
        scenario = ScenarioBundle.objects.create(
            area=area,
            version="v1.0",
            status=ScenarioBundle.STATUS_PENDING,
            parameters=request.data.get('parameters', {})
        )
        
        serializer = ScenarioBundleSerializer(scenario)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

class ScenarioBundleViewSet(viewsets.ModelViewSet):
    queryset = ScenarioBundle.objects.all().order_by('-created_at')
    serializer_class = ScenarioBundleSerializer

    @action(detail=True, methods=['post'])
    def run_simulation(self, request, pk=None):
        scenario = self.get_object()
        # Create a pending simulation run
        run = SimulationRun.objects.create(
            scenario=scenario,
            status=SimulationRun.STATUS_PENDING,
            water_level_start=request.data.get('water_level_start', 0.0),
            rainfall_mm=request.data.get('rainfall_mm', 50.0),
            duration_hours=request.data.get('duration_hours', 24.0)
        )
        
        serializer = SimulationRunSerializer(run)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

class SimulationRunViewSet(viewsets.ModelViewSet):
    queryset = SimulationRun.objects.all().order_by('-created_at')
    serializer_class = SimulationRunSerializer

# FBVs
def _collapse_report_to_dict(report):
    return {
        'id': report.external_id,
        'locationName': report.location_name,
        'latitude': report.latitude,
        'longitude': report.longitude,
        'description': report.description,
        'reporterName': report.reporter_name,
        'reporterPhone': report.reporter_phone,
        'videoFileName': report.video_file_name,
        'storedVideo_path': report.stored_video_path,
        'videoSizeBytes': report.video_size_bytes,
        'uploadedAtUtc': report.created_at.isoformat(),
        'processingStatus': report.processing_status,
        'splatPipelineHint': report.splat_pipeline_hint,
    }


def hotspots(request):
    if request.method != 'GET':
        return HttpResponse(status=405)

    ordered = sorted(load_hotspots_from_risk_areas(), key=lambda h: h.get("score", 0), reverse=True)
    return JsonResponse(ordered, safe=False)


def collapse_reports(request):
    if request.method == 'GET':
        reports = [_collapse_report_to_dict(item) for item in CollapseReport.objects.order_by('-created_at')[:500]]
        return JsonResponse(reports, safe=False)

    if request.method != 'POST':
        return HttpResponse(status=405)

    video = request.FILES.get('video')
    if video is None or video.size == 0:
        return _json_error("Envie um vídeo do celular na chave 'video'.")

    latitude = _parse_float(request.POST.get('latitude'))
    longitude = _parse_float(request.POST.get('longitude'))
    if latitude is None or longitude is None:
        return _json_error('Latitude e longitude são obrigatórias.')

    report_id = "RP-{}-{}".format(datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S'), uuid.uuid4().hex[:6])
    sanitized_video_name = secure_filename(video.name)
    safe_name = "{}-{}".format(report_id, sanitized_video_name)
    file_path = os.path.join(_uploads_directory(), safe_name)

    with open(file_path, 'wb+') as destination:
        for chunk in video.chunks():
            destination.write(chunk)

    with transaction.atomic():
        report = CollapseReport.objects.create(
            external_id=report_id,
            location_name=request.POST.get('locationName') or 'Sem nome',
            latitude=latitude,
            longitude=longitude,
            description=request.POST.get('description') or '',
            reporter_name=request.POST.get('reporterName') or '',
            reporter_phone=request.POST.get('reporterPhone') or '',
            video_file_name=video.name,
            stored_video_path=file_path,
            video_size_bytes=video.size,
            processing_status='Pending',
            splat_pipeline_hint='Pronto para ingestão em gaussian-splatting/convert.py e train.py',
        )

        AttentionAlert.objects.create(
            external_id='AL-{}'.format(uuid.uuid4().hex[:8]),
            title='Novo vídeo de deslizamento',
            message='Relato enviado de {}. Priorizar revisão de campo e drone.'.format(report.location_name),
            severity='critical',
            lat=latitude,
            lng=longitude,
            radius_meters=500,
        )

    return JsonResponse(_collapse_report_to_dict(report), status=201)


def rescue_support(request):
    if request.method != 'GET':
        return HttpResponse(status=405)

    area_m2 = _parse_float(request.GET.get('areaM2'))
    if area_m2 is None:
        area_m2 = 15000

    return JsonResponse(build_rescue_support(area_m2), safe=False)


def location_flow_simulation(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = _request_payload(request)
    lat = _parse_float(payload.get('lat', payload.get('sourceLat')))
    lng = _parse_float(payload.get('lng', payload.get('sourceLng')))
    rainfall_override = _parse_float(payload.get('rainfallMm', payload.get('rainfallMmPerHour')))
    slope_factor = _parse_float(payload.get('slopeFactor')) or 35.0
    steps = int(payload.get('steps') or 8)

    if lat is None or lng is None:
        return _json_error('lat/lng ou sourceLat/sourceLng são obrigatórios para simulação de fluxo.')

    terrain_ctx = terrain_open_data_context(lat, lng, rainfall_override)
    legacy = simulate_tailing_flow(lat, lng, slope_factor, steps, terrain_ctx)

    path = legacy.get('flowPath') or []
    flooded_cells = []
    max_depth = 0.0
    for point in path:
        depth = float(point.get('relativeDepthM') or 0.0)
        max_depth = max(max_depth, depth)
        flooded_cells.append({
            'lat': point.get('lat'),
            'lng': point.get('lng'),
            'depth': round(depth, 3),
            'terrain': point.get('terrain', {}).get('elevationM', 0),
            'velocity': round(0.8 + depth * 2.4, 3),
        })

    cell_size = _parse_float(payload.get('cellSizeMeters')) or 25
    estimated_area = len(flooded_cells) * (cell_size ** 2)

    return JsonResponse(
        {
            'generatedAtUtc': datetime.now(timezone.utc).isoformat(),
            'floodedCells': flooded_cells,
            'mainPath': [
                {
                    'lat': p.get('lat'),
                    'lng': p.get('lng'),
                    'step': p.get('step'),
                    'depth': round(float(p.get('relativeDepthM') or 0), 3),
                }
                for p in path
            ],
            'maxDepth': round(max_depth, 3),
            'estimatedAffectedAreaM2': round(estimated_area, 1),
            'disclaimer': legacy.get('notes'),
            'references': legacy.get('references'),
            'terrainContext': legacy.get('terrainContext'),
        },
        safe=False,
    )


def location_flow_simulation_stream(request):
    if request.method != 'GET':
        return HttpResponse(status=405)

    lat = _parse_float(request.GET.get('lat'))
    lng = _parse_float(request.GET.get('lng'))
    if lat is None or lng is None:
        return _json_error('lat/lng são obrigatórios para stream de simulação.')

    slope_factor = _parse_float(request.GET.get('slopeFactor')) or 35.0
    steps = int(request.GET.get('steps') or 8)
    rainfall_override = _parse_float(request.GET.get('rainfallMm'))

    terrain_ctx = terrain_open_data_context(lat, lng, rainfall_override)
    legacy = simulate_tailing_flow(lat, lng, slope_factor, steps, terrain_ctx)
    path = legacy.get('flowPath') or []

    def event_stream():
        for index, point in enumerate(path):
            payload = {
                'type': 'flow-step',
                'step': index,
                'lat': point.get('lat'),
                'lng': point.get('lng'),
                'depth': round(float(point.get('relativeDepthM') or 0), 3),
                'terrain': point.get('terrain', {}).get('elevationM', 0),
                'risk': point.get('terrain', {}).get('riskLevel', 'unknown'),
            }
            yield f"data: {json.dumps(payload)}\n\n"
        yield f"data: {json.dumps({'type': 'done', 'totalSteps': len(path)})}\n\n"

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response


def unified_easy_simulation(request):
    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = _request_payload(request)
    lat = _parse_float(payload.get('lat', payload.get('sourceLat')))
    lng = _parse_float(payload.get('lng', payload.get('sourceLng')))
    area_m2 = _parse_float(payload.get('areaM2')) or 15000

    if lat is None or lng is None:
        return _json_error('lat/lng ou sourceLat/sourceLng são obrigatórios para simulação unificada.')

    flow_response = location_flow_simulation(request)
    if flow_response.status_code >= 400:
        return flow_response

    flow_payload = json.loads(flow_response.content.decode('utf-8'))

    terrain = terrain_open_data_context(
        lat,
        lng,
        _parse_float(payload.get('rainfallMm', payload.get('rainfallMmPerHour'))),
    )

    return JsonResponse(
        {
            'generatedAtUtc': datetime.now(timezone.utc).isoformat(),
            'input': {
                'lat': lat,
                'lng': lng,
                'scenario': payload.get('scenario') or 'encosta',
            },
            'flowSimulation': flow_payload,
            'terrainContext': terrain,
            'rescueSupport': build_rescue_support(area_m2),
            'notes': 'Endpoint unificado para o modo fácil: fluxo + terreno + suporte tático.',
        },
        safe=False,
    )


def splat_convert(request):
    if request.method == 'GET':
        return JsonResponse(sorted(SPLAT_JOBS, key=lambda j: j['createdAtUtc'], reverse=True), safe=False)

    if request.method != 'POST':
        return HttpResponse(status=405)

    video = request.FILES.get('video')
    payload = _request_payload(request)

    lat = _parse_float(payload.get('latitude'))
    lng = _parse_float(payload.get('longitude'))

    if video is None or video.size == 0:
        return _json_error("Envie o vídeo na chave 'video'.")
    if lat is None or lng is None:
        return _json_error('latitude e longitude são obrigatórios para converter em .splat.')

    job_id = 'SPLAT-{}'.format(uuid.uuid4().hex[:8])
    safe_name = '{}-{}'.format(job_id, secure_filename(video.name))
    file_path = os.path.join(_uploads_directory(), safe_name)

    with open(file_path, 'wb+') as destination:
        for chunk in video.chunks():
            destination.write(chunk)

    splat_url = '/media/splats/{}.splat'.format(job_id.lower())
    job = {
        'id': job_id,
        'status': 'Queued',
        'videoFileName': video.name,
        'storedVideoPath': file_path,
        'latitude': lat,
        'longitude': lng,
        'radiusMeters': 500,
        'splatUrl': splat_url,
        'createdAtUtc': datetime.now(timezone.utc).isoformat(),
        'pipeline': ['extract_frames', 'gaussian_splat_train', 'export_splat'],
    }

    SPLAT_JOBS.append(job)
    AttentionAlert.objects.create(
        external_id='AL-{}'.format(uuid.uuid4().hex[:8]),
        title='Nova cena 3D em processamento',
        message='Conversão Gaussian Splatting iniciada para área demarcada.',
        severity='medium',
        lat=lat,
        lng=lng,
        radius_meters=500,
    )

    return JsonResponse(job, status=201)

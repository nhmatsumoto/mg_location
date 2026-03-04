from django.core.management.base import BaseCommand

from apps.api.models import AttentionAlert, MapAnnotation, MissingPerson, RescueGroup, SupplyLogistics


SEED_RISK_AREAS = [
    {
        'external_id': 'RA-CHUVA-001',
        'title': 'Risco de enchente - Ribeirão Arrudas',
        'lat': -19.9221,
        'lng': -43.9453,
        'severity': 'critical',
        'radius_meters': 1200,
        'metadata': {
            'hazardType': 'flood',
            'source': 'seed-defesa-civil',
            'city': 'Belo Horizonte',
            'state': 'MG',
            'timeline': [
                {'at': '2025-01-14T03:00:00Z', 'severity': 'high', 'message': 'Alerta de chuva forte'},
                {'at': '2025-01-14T05:00:00Z', 'severity': 'critical', 'message': 'Transbordamento em curso'},
            ],
        },
    },
    {
        'external_id': 'RA-CHUVA-002',
        'title': 'Risco de inundação - Vale do Itajaí',
        'lat': -26.9185,
        'lng': -49.0658,
        'severity': 'high',
        'radius_meters': 1600,
        'metadata': {
            'hazardType': 'flood',
            'source': 'seed-defesa-civil',
            'city': 'Blumenau',
            'state': 'SC',
            'timeline': [
                {'at': '2025-01-15T00:30:00Z', 'severity': 'medium', 'message': 'Atenção para elevação do rio'},
                {'at': '2025-01-15T03:30:00Z', 'severity': 'high', 'message': 'Risco de alagamento nas margens'},
            ],
        },
    },
    {
        'external_id': 'RA-CHUVA-003',
        'title': 'Deslizamento e enxurrada - Serra do Mar',
        'lat': -23.9668,
        'lng': -46.3144,
        'severity': 'critical',
        'radius_meters': 950,
        'metadata': {
            'hazardType': 'rain_landslide',
            'source': 'seed-defesa-civil',
            'city': 'Santos',
            'state': 'SP',
            'timeline': [
                {'at': '2025-01-16T01:00:00Z', 'severity': 'high', 'message': 'Solo saturado em encostas'},
                {'at': '2025-01-16T04:00:00Z', 'severity': 'critical', 'message': 'Ocorrência de deslizamentos pontuais'},
            ],
        },
    },
]

SEED_SUPPORT_POINTS = [
    {
        'external_id': 'SP-CHUVA-001',
        'title': 'Abrigo Municipal - Pampulha',
        'lat': -19.8596,
        'lng': -43.9675,
        'metadata': {'capacity': 180, 'type': 'abrigamento', 'city': 'Belo Horizonte'},
    },
    {
        'external_id': 'SP-CHUVA-002',
        'title': 'Base logística Defesa Civil - Blumenau',
        'lat': -26.9154,
        'lng': -49.0702,
        'metadata': {'capacity': 95, 'type': 'logistica', 'city': 'Blumenau'},
    },
]

SEED_ALERTS = [
    {
        'external_id': 'AL-CHUVA-001',
        'title': 'Alerta severo de chuva acumulada',
        'message': 'Defesa Civil: possibilidade de inundação rápida em áreas ribeirinhas.',
        'severity': 'high',
        'lat': -19.9221,
        'lng': -43.9453,
        'radius_meters': 2000,
    },
    {
        'external_id': 'AL-CHUVA-002',
        'title': 'Alerta de enchente em curso',
        'message': 'Nível do rio acima da cota em bairros de baixa altitude.',
        'severity': 'critical',
        'lat': -26.9185,
        'lng': -49.0658,
        'radius_meters': 2500,
    },
]

SEED_MISSING_PERSONS = [
    {
        'external_id': 'MP-LOCAL-001',
        'person_name': 'Carla Mendes',
        'age': 29,
        'city': 'Belo Horizonte',
        'last_seen_location': 'Avenida Tereza Cristina',
        'lat': -19.9375,
        'lng': -43.9598,
        'physical_description': 'Jaqueta azul e mochila cinza.',
        'additional_info': 'Último contato às 06:15 durante chuva intensa.',
        'contact_name': 'Paulo Mendes',
        'contact_phone': '+55 31 98888-1010',
    },
]

SEED_RESCUE_GROUPS = [
    {
        'external_id': 'RG-LOCAL-001',
        'name': 'Equipe Alfa',
        'members': 8,
        'specialty': 'Busca em área inundada',
        'status': 'em_campo',
        'lat': -19.9229,
        'lng': -43.9432,
    },
]

SEED_SUPPLY_LOGISTICS = [
    {
        'external_id': 'SL-LOCAL-001',
        'item': 'Kits de primeiros socorros',
        'quantity': 120,
        'status': 'em_transporte',
        'origin': 'Centro Logístico Pampulha',
        'destination': 'Abrigo Municipal - Pampulha',
    },
]


class Command(BaseCommand):
    help = 'Popula o mapa operacional com áreas de risco/enchente, pontos de apoio e alertas de chuva.'

    def handle(self, *args, **options):
        risk_created = 0
        support_created = 0
        alerts_created = 0
        missing_created = 0
        groups_created = 0
        supply_created = 0

        for item in SEED_RISK_AREAS:
            _, created = MapAnnotation.objects.update_or_create(
                external_id=item['external_id'],
                defaults={
                    'record_type': MapAnnotation.TYPE_RISK_AREA,
                    'title': item['title'],
                    'lat': item['lat'],
                    'lng': item['lng'],
                    'severity': item['severity'],
                    'radius_meters': item['radius_meters'],
                    'status': 'active',
                    'metadata': item['metadata'],
                },
            )
            if created:
                risk_created += 1

        for item in SEED_SUPPORT_POINTS:
            _, created = MapAnnotation.objects.update_or_create(
                external_id=item['external_id'],
                defaults={
                    'record_type': MapAnnotation.TYPE_SUPPORT_POINT,
                    'title': item['title'],
                    'lat': item['lat'],
                    'lng': item['lng'],
                    'status': 'active',
                    'metadata': item['metadata'],
                },
            )
            if created:
                support_created += 1

        for item in SEED_ALERTS:
            _, created = AttentionAlert.objects.update_or_create(
                external_id=item['external_id'],
                defaults={
                    'title': item['title'],
                    'message': item['message'],
                    'severity': item['severity'],
                    'lat': item['lat'],
                    'lng': item['lng'],
                    'radius_meters': item['radius_meters'],
                },
            )
            if created:
                alerts_created += 1

        for item in SEED_MISSING_PERSONS:
            _, created = MissingPerson.objects.update_or_create(
                external_id=item['external_id'],
                defaults=item,
            )
            if created:
                missing_created += 1

        for item in SEED_RESCUE_GROUPS:
            _, created = RescueGroup.objects.update_or_create(
                external_id=item['external_id'],
                defaults=item,
            )
            if created:
                groups_created += 1

        for item in SEED_SUPPLY_LOGISTICS:
            _, created = SupplyLogistics.objects.update_or_create(
                external_id=item['external_id'],
                defaults=item,
            )
            if created:
                supply_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                'Seed concluído: '
                f'riskAreas(created={risk_created}) '
                f'supportPoints(created={support_created}) '
                f'alerts(created={alerts_created}) '
                f'missing(created={missing_created}) '
                f'rescueGroups(created={groups_created}) '
                f'supply(created={supply_created})'
            )
        )

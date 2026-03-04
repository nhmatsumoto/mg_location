from django.test import TestCase
from django.urls import reverse

from apps.api.management.commands.seed_rain_flood_map import Command as SeedCommand


class LocalhostContractTests(TestCase):
    def setUp(self):
        SeedCommand().handle()

    def test_operations_snapshot_has_seeded_signal(self):
        response = self.client.get(reverse('api:operations_snapshot'))
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(payload['kpis']['activeTeams'], 1)
        self.assertGreaterEqual(payload['kpis']['suppliesInTransit'], 1)
        self.assertGreaterEqual(len(payload['layers']['missingPersons']), 1)

    def test_weather_endpoint_requires_coordinates(self):
        response = self.client.get(reverse('api:weather_nowcast'))
        self.assertEqual(response.status_code, 400)

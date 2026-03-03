from django.test import SimpleTestCase
from django.urls import resolve, reverse

from apps.api import views_disasters, views_modules


class UrlsRegressionTestCase(SimpleTestCase):
    def test_disaster_crawl_route_is_wired(self):
        match = resolve(reverse('api:disasters_crawl_trigger'))
        self.assertEqual(match.func, views_disasters.disasters_crawl_trigger)

    def test_incident_collection_route_is_wired(self):
        match = resolve(reverse('api:incidents_collection'))
        self.assertEqual(match.func, views_modules.incidents_collection)

from django.test import TestCase
from apps.api.services.simulation.engines.landslide import LandslideEngine
from apps.api.services.simulation.engines.earthquake import EarthquakeEngine
from apps.api.models_simulation import SimulationArea

class SimulationEnginesTestCase(TestCase):
    def setUp(self):
        self.area = SimulationArea.objects.create(
            name="Test Area",
            bbox_min_lat=0.0,
            bbox_min_lng=0.0,
            bbox_max_lat=1.0,
            bbox_max_lng=1.0
        )
        self.datasets = {
            'elevation': {'data': 'mock'},
            'buildings': {'features': [{'id': 'b1'}]}
        }

    def test_landslide_engine_validation(self):
        engine = LandslideEngine()
        self.assertTrue(engine.validate(self.area, {'rainfall_mm': 100}, self.datasets))
        self.assertFalse(engine.validate(self.area, {}, self.datasets))

    def test_landslide_engine_execution(self):
        engine = LandslideEngine()
        result = engine.run(self.area, {'rainfall_mm': 150}, self.datasets)
        
        self.assertIn('landslide_hotspots', result.impact_layers)
        self.assertIn('average_susceptibility_score', result.metrics)
        self.assertGreater(result.metrics['average_susceptibility_score'], 0)

    def test_earthquake_engine_validation(self):
        engine = EarthquakeEngine()
        self.assertTrue(engine.validate(self.area, {'magnitude': 7.0}, self.datasets))
        self.assertFalse(engine.validate(self.area, {}, self.datasets))

    def test_earthquake_engine_execution(self):
        engine = EarthquakeEngine()
        result = engine.run(self.area, {'magnitude': 7.0, 'depth_km': 10.0}, self.datasets)
        
        self.assertIn('shake_intensity', result.impact_layers)
        self.assertIn('max_intensity', result.metrics)
        self.assertGreater(result.metrics['max_intensity'], 0)

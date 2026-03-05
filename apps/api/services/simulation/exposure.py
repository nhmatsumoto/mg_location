from typing import Dict, Any
import logging
from .interfaces import IExposureBuilder

logger = logging.getLogger(__name__)

class ExposureBuilder(IExposureBuilder):
    """
    MVP Exposure Builder leveraging a mocked generic fallback.
    In future, this hits OSM Overpass and standardizes local stats.
    """
    def build_exposure(self, area: Any) -> Dict[str, Any]:
        logger.info(f"Building MVP Exposure for area {area.id}")
        
        bbox_lng = area.bbox_min_lng
        bbox_lat = area.bbox_min_lat

        mock_buildings = [
            {"id": "bldg_1", "type": "building", "use": "residential", "coordinates": [bbox_lng + 0.001, bbox_lat + 0.001], "vulnerability_class": "moderate"},
            {"id": "bldg_2", "type": "critical_infra", "use": "hospital", "coordinates": [bbox_lng + 0.002, bbox_lat + 0.002], "vulnerability_class": "low"}
        ]

        mock_population = {
            "total_estimate": 1500,
            "density_per_sqkm": 200
        }

        return {
            "source": "osm_fallback_stub",
            "buildings": mock_buildings,
            "population": mock_population
        }

from typing import Dict, Any
from ..interfaces import IHazardEngine, ImpactResult
import logging

logger = logging.getLogger(__name__)

class EarthquakeEngine(IHazardEngine):
    """
    MVP Earthquake Engine.
    Requires: magnitude (param), depth_km (param).
    """
    def validate(self, area: Any, parameters: Dict[str, Any], datasets: Dict[str, Any]) -> bool:
        return 'magnitude' in parameters

    def run(self, area: Any, parameters: Dict[str, Any], datasets: Dict[str, Any]) -> ImpactResult:
        logger.info(f"Running EarthquakeEngine for area {area.id}")
        
        magnitude = float(parameters.get('magnitude', 5.0))
        depth = float(parameters.get('depth_km', 10.0))
        
        # MVP: very simple impact attenuation mock
        intensity = magnitude * (10 / (depth + 1))
        affected_buildings = int(intensity * 10) if intensity > 4.0 else 0
        
        return ImpactResult(
            impact_layers={
                'shake_intensity': 'mock_path_to_shake_map'
            },
            metrics={
                'max_intensity': min(intensity, 10.0),
                'affected_buildings_estimate': affected_buildings
            },
            notes=[f"Calculated using MVP Magnitude attenuation. Mag={magnitude}, Depth={depth}"]
        )

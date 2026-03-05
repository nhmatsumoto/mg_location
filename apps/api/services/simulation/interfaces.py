from abc import ABC, abstractmethod
from typing import Dict, Any, List
from dataclasses import dataclass, field

@dataclass
class ImpactResult:
    """
    Standardized result from any Hazard Engine.
    """
    impact_layers: Dict[str, Any] = field(default_factory=dict) # e.g., {'hazard_intensity': 'path/to/layer', 'impact_severity': ...}
    metrics: Dict[str, Any] = field(default_factory=dict) # e.g., {'affected_population': 1000, 'critical_infra': 5}
    notes: List[str] = field(default_factory=list)


class IHazardEngine(ABC):
    """
    Contract for all hazard physics/deterministic engines.
    """
    @abstractmethod
    def validate(self, area: Any, parameters: Dict[str, Any], datasets: Dict[str, Any]) -> bool:
        """
        Validates if the provided parameters and datasets are sufficient to run this engine.
        """
        pass

    @abstractmethod
    def run(self, area: Any, parameters: Dict[str, Any], datasets: Dict[str, Any]) -> ImpactResult:
        """
        Executes the hazard model and returns the ImpactResult.
        """
        pass


class IDatasetProvider(ABC):
    @abstractmethod
    def fetch(self, area: Any, dataset_type: str) -> Dict[str, Any]:
        """
        Fetches or points to a cached dataset (terrain, weather, hydro, etc) for the area.
        """
        pass


class IExposureBuilder(ABC):
    @abstractmethod
    def build_exposure(self, area: Any) -> Dict[str, Any]:
        """
        Builds the exposure model (people, buildings, infrastructure) for the given area.
        """
        pass


class IRiskAssessor(ABC):
    @abstractmethod
    def assess(self, hazard_result: Any, exposure: Dict[str, Any], vulnerability: Dict[str, Any]) -> ImpactResult:
        """
        Combines hazard intensity with exposure and vulnerability to generate final impact.
        Often wrapped inside the Engine's `run` method in MWP.
        """
        pass


class ILayerPublisher(ABC):
    @abstractmethod
    def publish(self, layer_data: Any, layer_type: str) -> str:
        """
        Publishes a layer (Raster/GeoJSON) and returns its accessible URI/path.
        """
        pass

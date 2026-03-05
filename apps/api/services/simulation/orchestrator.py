import logging
from typing import Dict, Any
from .interfaces import ImpactResult, IHazardEngine, IExposureBuilder
from apps.api.models_simulation import Scenario, SimulationRun

logger = logging.getLogger(__name__)

class ScenarioOrchestrator:
    """
    Manages the lifecycle of a scenario:
    Gathering datasets -> Building Exposure -> Running Hazard Engine -> Assessment -> Publishing.
    """
    def __init__(self, scenario: Scenario):
        self.scenario = scenario
        self.area = scenario.area

    def build_scenario(self, exposure_builder: IExposureBuilder) -> bool:
        """
        Step 1: Gathers datasets and builds exposure.
        """
        logger.info(f"Building Scenario {self.scenario.id}")
        self.scenario.status = Scenario.STATUS_PENDING
        self.scenario.save()
        
        try:
            # MVP: Assuming datasets form is mocked or handled via exposure builder
            exposure_data = exposure_builder.build_exposure(self.area)
            self.scenario.datasets['exposure'] = exposure_data
            
            # Additional dataset fetches would happen here and added to self.scenario.datasets
            
            self.scenario.status = Scenario.STATUS_READY
            self.scenario.save()
            return True
        except Exception as e:
            logger.error(f"Failed to build scenario: {e}")
            self.scenario.status = Scenario.STATUS_FAILED
            self.scenario.save()
            return False

    def run_simulation(self, run: SimulationRun, engine: IHazardEngine) -> SimulationRun:
        """
        Step 2: Executes the Hazard Engine and records the results.
        """
        logger.info(f"Running Simulation {run.id} for Scenario {self.scenario.id}")
        run.status = SimulationRun.STATUS_RUNNING
        run.save()

        try:
            if not engine.validate(self.area, self.scenario.parameters, self.scenario.datasets):
                raise ValueError("Engine validation failed. Invalid parameters or missing datasets.")

            impact_result: ImpactResult = engine.run(self.area, self.scenario.parameters, self.scenario.datasets)
            
            run.metrics = impact_result.metrics
            run.impact_layers = impact_result.impact_layers
            run.logs = impact_result.notes
            run.status = SimulationRun.STATUS_COMPLETED
            
        except Exception as e:
            logger.error(f"SimulationRun {run.id} failed: {e}")
            run.logs.append(f"Error: {str(e)}")
            run.status = SimulationRun.STATUS_FAILED
            
        run.save()
        return run

import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import SimulationArea, ScenarioBundle, SimulationRun
from .serializers_simulation import SimulationAreaSerializer, ScenarioBundleSerializer, SimulationRunSerializer

logger = logging.getLogger(__name__)

class SimulationAreaViewSet(viewsets.ModelViewSet):
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

from rest_framework import serializers
from .models import SimulationArea, ScenarioBundle, SimulationRun

class SimulationAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationArea
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ScenarioBundleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScenarioBundle
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'terrain_path', 'buildings_path']

class SimulationRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationRun
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'status', 'metrics', 'artifacts']

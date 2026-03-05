import uuid
from django.db import models

class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SimulationArea(TimestampedModel):
    """
    User-defined 3D geographic slice for the sandbox.
    Stores the Bounding Box and an optional arbitrary polygon representation.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, default="New Simulation Area")
    bbox_min_lat = models.FloatField()
    bbox_min_lng = models.FloatField()
    bbox_max_lat = models.FloatField()
    bbox_max_lng = models.FloatField()
    polygon_geometry = models.JSONField(default=dict, blank=True, help_text="Optional complex geometry")


class Scenario(TimestampedModel):
    """
    The compiled scenario extracting datasets (terrain, buildings, etc) for a specific hazard.
    """
    STATUS_PENDING = 'pending'
    STATUS_READY = 'ready'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_READY, 'Ready'),
        (STATUS_FAILED, 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    area = models.ForeignKey(SimulationArea, on_delete=models.CASCADE, related_name='scenarios')
    version = models.CharField(max_length=50, default="v1.0")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    
    hazard_type = models.CharField(max_length=50, help_text="e.g. earthquake, cyclone, flood, landslide, dambreak, contamination")
    parameters = models.JSONField(default=dict, blank=True, help_text="Specific parameters for the hazard")
    datasets = models.JSONField(default=dict, blank=True, help_text="Paths or metadata of fetched datasets (terrain, exposure, etc)")


class SimulationRun(TimestampedModel):
    """
    A single execution of a Hazard Engine over a Scenario.
    """
    STATUS_PENDING = 'pending'
    STATUS_RUNNING = 'running'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_RUNNING, 'Running'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED, 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE, related_name='runs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    
    # Generic outputs
    metrics = models.JSONField(default=dict, blank=True, help_text="Standardized metrics: affected people, buildings, etc")
    impact_layers = models.JSONField(default=dict, blank=True, help_text="Paths to output textures or GeoJSON layers")
    logs = models.JSONField(default=list, blank=True, help_text="Execution logs and notes")

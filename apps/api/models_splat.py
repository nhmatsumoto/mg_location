from django.db import models
from django.conf import settings

class SplatAsset(models.Model):
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='splats/')
    description = models.TextField(blank=True, null=True)
    
    # Georeferencing
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    heading = models.FloatField(default=0.0)
    scale = models.FloatField(default=1.0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Association with events/incidents
    event_id = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

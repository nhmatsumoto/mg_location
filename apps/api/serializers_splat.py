from rest_framework import serializers
from .models_splat import SplatAsset

class SplatAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = SplatAsset
        fields = [
            'id', 'title', 'file', 'file_url', 'description', 
            'latitude', 'longitude', 'heading', 'scale', 
            'event_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None

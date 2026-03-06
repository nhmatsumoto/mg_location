from rest_framework import viewsets, permissions
from rest_framework.response import Response
from django.http import FileResponse
from apps.api.models_splat import SplatAsset
from apps.api.serializers_splat import SplatAssetSerializer

class SplatAssetViewSet(viewsets.ModelViewSet):
    queryset = SplatAsset.objects.all()
    serializer_class = SplatAssetSerializer
    permission_classes = [permissions.AllowAny] # Adjust as needed

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.query_params.get('download') == '1':
            return FileResponse(
                instance.file, 
                as_attachment=True, 
                filename=instance.file.name
            )
        return super().retrieve(request, *args, **kwargs)

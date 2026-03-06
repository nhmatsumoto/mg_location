import json
import logging
import os
import uuid
from datetime import datetime, timezone

import googlemaps
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.api.serializers import CoordinateSerializer
from apps.api.utils import Position

logger = logging.getLogger(__name__)


def _json_error(message, status_code=400):
    logger.warning("api_json_error status=%s message=%s", status_code, message)
    return JsonResponse({"error": message}, status=status_code)


def _parse_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _request_payload(request):
    """Safely extracts JSON payload from request body."""
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {}


def _uploads_directory():
    """Ensures and returns the uploads directory path."""
    path = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(path, exist_ok=True)
    return path


class CalculateCoordinate(APIView):
    """View to return possible victims coordinates."""

    def get(self, request):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def post(self, request):
        serializer = CoordinateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lat = serializer.validated_data['lat']
        lng = serializer.validated_data['lng']
        vector_position = Position(lat, lng).calc_vector()
        return Response(vector_position, status=status.HTTP_200_OK)


calculatecoordinate = CalculateCoordinate.as_view()


def health_check(request):
    """Basic health check endpoint."""
    return JsonResponse({"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()})


def get_elevation(lat, lng):
    gmaps = googlemaps.Client(key=settings.GMAPS_API_KEY)
    geocode_result = gmaps.elevation((lat, lng))
    return geocode_result[0]['elevation']

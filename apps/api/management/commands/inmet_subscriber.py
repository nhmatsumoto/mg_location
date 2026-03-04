import json
import logging
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt
from django.core.management.base import BaseCommand
from django.conf import settings

from apps.api.models import DisasterEvent
from apps.api.services.disasters.constants import normalize_event_type, normalize_severity
from apps.api.services.disasters.country_resolver import CountryResolver

logger = logging.getLogger(__name__)

# WIS2 Global Broker (Public NOAA Broker)
MQTT_BROKER = "wis2globalbroker.nws.noaa.gov"
MQTT_PORT = 8883
MQTT_USER = "everyone"
MQTT_PASS = "everyone"
# CAP Alerts topic for INMET
MQTT_TOPIC = "cache/a/wis2/br-inmet/data/core/weather/advisories-warnings"

class Command(BaseCommand):
    help = "Runs a persistent MQTT subscriber for real-time INMET alerts (WIS2)."

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.country_resolver = CountryResolver()

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS(f"Starting INMET WIS2 Subscriber on {MQTT_BROKER}..."))
        
        client = mqtt.Client(client_id=f"mg-location-tactical-{int(time.time())}")
        client.username_pw_set(MQTT_USER, MQTT_PASS)
        client.tls_set()  # Enable TLS for port 8883
        
        client.on_connect = self.on_connect
        client.on_message = self.on_message
        client.on_disconnect = self.on_disconnect

        while True:
            try:
                client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
                client.loop_forever()
            except Exception as e:
                logger.error("MQTT connection failed, retrying in 30s... err=%s", e)
                time.sleep(30)

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.stdout.write(self.style.SUCCESS("Connected to WIS2 Broker!"))
            client.subscribe(MQTT_TOPIC)
        else:
            logger.error("Failed to connect to MQTT broker, rc=%s", rc)

    def on_disconnect(self, client, userdata, rc):
        self.stdout.write(self.style.WARNING("Disconnected from MQTT broker."))

    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode('utf-8'))
            self.process_alert(payload)
        except Exception as e:
            logger.error("Failed to process MQTT message: %s", e)

    def process_alert(self, data):
        """
        Parses WIS2/CAP alert and stores in DisasterEvent.
        """
        # WIS2 notifications often contain metadata and a link to the actual CAP file.
        # This implementation handles the basic metadata if present, 
        # but in production you'd fetch the referenced bundle.
        
        # Example heuristic for WIS2 metadata:
        properties = data.get('properties', {})
        geometry = data.get('geometry', {})
        
        event_id = data.get('id') or f"mqtt-{int(time.time())}"
        title = properties.get('title') or "INMET Real-time Alert"
        ts_str = properties.get('pubDate') or datetime.now(timezone.utc).isoformat()
        
        try:
            ts = datetime.fromisoformat(ts_str.replace('Z', '+00:00'))
        except:
            ts = datetime.now(timezone.utc)

        # Extraction from geometry (Point or Polygon)
        lat, lon = 0, 0
        if geometry.get('type') == 'Point':
            lon, lat = geometry.get('coordinates', [0, 0])
        
        country_code, country_name = self.country_resolver.resolve(round(lat, 2), round(lon, 2))

        # Persistence
        from django.db import transaction
        with transaction.atomic():
            DisasterEvent.objects.update_or_create(
                provider='INMET_MQTT',
                provider_event_id=event_id,
                defaults={
                    'event_type': normalize_event_type('storm'),
                    'severity': 3,  # Baseline
                    'title': title[:255],
                    'description': properties.get('description', '')[:2000],
                    'start_at': ts,
                    'lat': lat,
                    'lon': lon,
                    'country_code': country_code,
                    'country_name': country_name,
                    'geometry': geometry,
                    'source_url': properties.get('link', ''),
                    'raw_payload': data,
                }
            )
        logger.info("ingested_mqtt_alert id=%s title=%s", event_id, title)

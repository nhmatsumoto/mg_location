import os
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from urllib.request import urlopen

from apps.api.integrations.core.cache import shared_cache
from apps.api.integrations.core.normalize_schemas import normalize_alert


def _parse_iso(dt):
    if not dt:
        return None
    try:
        return datetime.fromisoformat(dt.replace('Z', '+00:00'))
    except ValueError:
        return None


def _bbox_contains(bbox, lat, lon):
    min_lon, min_lat, max_lon, max_lat = bbox
    return min_lat <= lat <= max_lat and min_lon <= lon <= max_lon


def _extract_points(polygons):
    points = []
    for polygon in polygons:
        chunks = polygon.replace(',', ' ').split()
        for i in range(0, len(chunks) - 1, 2):
            try:
                lat = float(chunks[i])
                lon = float(chunks[i + 1])
                points.append((lat, lon))
            except ValueError:
                continue
    return points


def _parse_feed_xml(raw_xml):
    root = ET.fromstring(raw_xml)
    ns = {
        'cap': 'urn:oasis:names:tc:emergency:cap:1.2',
        'atom': 'http://www.w3.org/2005/Atom',
        'rss': 'http://purl.org/rss/1.0/',
    }

    alerts = []
    cap_entries = root.findall('.//cap:alert', ns)
    if cap_entries:
        for node in cap_entries:
            alerts.append({
                'identifier': node.findtext('cap:identifier', default='', namespaces=ns),
                'event': node.findtext('.//cap:event', default='', namespaces=ns),
                'severity': node.findtext('.//cap:severity', default='', namespaces=ns),
                'urgency': node.findtext('.//cap:urgency', default='', namespaces=ns),
                'certainty': node.findtext('.//cap:certainty', default='', namespaces=ns),
                'effective': node.findtext('.//cap:effective', default='', namespaces=ns),
                'expires': node.findtext('.//cap:expires', default='', namespaces=ns),
                'references': [node.findtext('cap:references', default='', namespaces=ns)] if node.findtext('cap:references', default='', namespaces=ns) else [],
                'area': {
                    'desc': [node.findtext('.//cap:areaDesc', default='', namespaces=ns)],
                    'polygons': [v.text for v in node.findall('.//cap:polygon', ns) if v.text],
                },
            })
        return alerts

    for item in root.findall('.//item') + root.findall('.//atom:entry', ns):
        title = item.findtext('title') or item.findtext('atom:title', default='', namespaces=ns)
        pub_date = item.findtext('pubDate') or item.findtext('updated') or item.findtext('atom:updated', default='', namespaces=ns)
        alerts.append({
            'identifier': item.findtext('guid') or title,
            'event': title,
            'severity': 'unknown',
            'urgency': 'unknown',
            'certainty': 'unknown',
            'effective': pub_date,
            'expires': None,
            'references': [item.findtext('link') or item.findtext('atom:link', default='', namespaces=ns)],
            'area': {'desc': [], 'polygons': []},
        })
    return alerts


class AlertFeedRegistry:
    def __init__(self):
        feeds_env = os.getenv('CAP_ALERT_FEEDS', '').strip()
        if feeds_env:
            self.feeds = [part.strip() for part in feeds_env.split(',') if part.strip()]
        else:
            self.feeds = ['https://apiprevmet3.inmet.gov.br/avisos/rss']

    def fetch(self, bbox=None, since=None):
        key = f"alerts:{self.feeds}:{bbox}:{since}"
        cached, hit = shared_cache.get(key)
        if hit:
            return cached, True

        normalized = []
        for feed in self.feeds:
            try:
                with urlopen(feed, timeout=12) as response:
                    xml_data = response.read().decode('utf-8', errors='ignore')
                parsed = _parse_feed_xml(xml_data)
                for row in parsed:
                    item = normalize_alert(row, source='inmet-cap')
                    if since:
                        effective = _parse_iso(item.get('effective'))
                        since_dt = _parse_iso(since)
                        if effective and since_dt and effective < since_dt:
                            continue
                    if bbox and item.get('polygons'):
                        points = _extract_points(item.get('polygons'))
                        if points and not any(_bbox_contains(bbox, p[0], p[1]) for p in points):
                            continue
                    normalized.append(item)
            except Exception:
                continue

        shared_cache.set(key, normalized, ttl=180)
        return normalized, False


alert_feed_registry = AlertFeedRegistry()

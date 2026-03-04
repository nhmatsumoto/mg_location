import logging
import os

logger = logging.getLogger(__name__)

from apps.api.integrations.core.cache import shared_cache
from apps.api.integrations.core.http_client import http_client
from apps.api.integrations.core.normalize_schemas import normalize_stac

STAC_URL = os.getenv('PLANETARY_STAC_URL', 'https://planetarycomputer.microsoft.com/api/stac/v1/search')


def search_stac(collection, bbox, start, end, limit=20):
    logger.info("integration.stac.search.request", extra={"collection": collection, "bbox": bbox})
    bbox_parts = [float(v) for v in bbox.split(',')]
    params = {
        'collections': collection,
        'bbox': ','.join([str(v) for v in bbox_parts]),
        'datetime': f'{start}/{end}',
        'limit': int(limit),
    }
    key = f"stac:{collection}:{bbox}:{start}:{end}:{limit}"
    cached, hit = shared_cache.get(key)
    if hit:
        logger.info("integration.cache.hit", extra={"module": __name__})
        return cached, True

    payload = http_client.get_json(STAC_URL, params=params, source='planetary-stac')
    normalized = normalize_stac(payload, collection)
    shared_cache.set(key, normalized, ttl=3600)
    return normalized, False

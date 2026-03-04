from apps.api.integrations.core.cache import shared_cache

LANDSAT_MISSION_URL = 'https://science.nasa.gov/mission/landsat/'
LANDSAT_EARTHSEARCH_STAC = 'https://landsatlook.usgs.gov/stac-server'


def fetch_landsat_catalog():
    key = 'satellite:landsat:catalog'
    cached, hit = shared_cache.get(key)
    if hit:
        return cached, True

    data = {
        'source': 'nasa-landsat',
        'missionUrl': LANDSAT_MISSION_URL,
        'stacApi': LANDSAT_EARTHSEARCH_STAC,
        'collections': [
            {
                'id': 'landsat-c2l2-sr',
                'title': 'Landsat Collection 2 Level-2 Surface Reflectance',
                'provider': 'USGS/NASA',
                'description': 'Imagens multiespectrais de superfície para monitoramento ambiental e desastres.',
            },
            {
                'id': 'landsat-c2l2-st',
                'title': 'Landsat Collection 2 Level-2 Surface Temperature',
                'provider': 'USGS/NASA',
                'description': 'Temperatura de superfície para análise de ilhas de calor, secas e incêndios.',
            },
        ],
    }
    shared_cache.set(key, data, ttl=86400)
    return data, False

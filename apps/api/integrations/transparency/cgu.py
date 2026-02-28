import os
from urllib.parse import urlencode

from apps.api.integrations.core.cache import shared_cache
from apps.api.integrations.core.http_client import http_client
from apps.api.integrations.core.normalize_schemas import normalize_transparency

BASE_URL = os.getenv('TRANSPARENCIA_BASE_URL', 'https://api.portaldatransparencia.gov.br/api-de-dados')


class TransparencyApiKeyMissing(RuntimeError):
    pass


def _headers():
    key = os.getenv('TRANSPARENCIA_API_KEY', '').strip()
    if not key:
        raise TransparencyApiKeyMissing('TRANSPARENCIA_API_KEY não configurada. Defina no .env para habilitar os endpoints de transparência.')
    return {'chave-api-dados': key}


def fetch_transfers(uf=None, municipio=None, start=None, end=None):
    params = {
        'uf': uf or '',
        'municipio': municipio or '',
        'dataInicio': start or '',
        'dataFim': end or '',
        'pagina': 1,
    }
    key = f"transfers:{urlencode(params)}"
    cached, hit = shared_cache.get(key)
    if hit:
        return cached, True

    payload = http_client.get_json(f'{BASE_URL}/transferencias', params=params, headers=_headers(), source='cgu-transfers')
    normalized = normalize_transparency(payload if isinstance(payload, list) else [payload])
    shared_cache.set(key, normalized, ttl=21600)
    return normalized, False


def search(query, start=None, end=None):
    params = {
        'termo': query,
        'dataInicio': start or '',
        'dataFim': end or '',
        'pagina': 1,
    }
    key = f"transparency-search:{urlencode(params)}"
    cached, hit = shared_cache.get(key)
    if hit:
        return cached, True

    payload = http_client.get_json(f'{BASE_URL}/busca-livre', params=params, headers=_headers(), source='cgu-search')
    items = payload if isinstance(payload, list) else payload.get('resultados', []) if isinstance(payload, dict) else []
    normalized = normalize_transparency(items)
    shared_cache.set(key, normalized, ttl=21600)
    return normalized, False

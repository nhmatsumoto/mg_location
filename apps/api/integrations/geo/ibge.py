from urllib.parse import urlencode

from apps.api.integrations.core.cache import shared_cache
from apps.api.integrations.core.http_client import http_client

IBGE_LOCALIDADES_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios'


def fetch_municipios(uf=None, nome=None, limit=20):
    params = {'orderBy': 'nome'}
    if uf:
        params['UF'] = str(uf).upper()

    key = f"ibge:municipios:{urlencode(sorted(params.items()))}:{nome or ''}:{limit}"
    cached, hit = shared_cache.get(key)
    if hit:
        return cached, True

    payload = http_client.get_json(IBGE_LOCALIDADES_URL, params=params, source='ibge-municipios')
    items = payload if isinstance(payload, list) else []

    query = (nome or '').strip().lower()
    normalized = []
    for row in items:
        city_name = row.get('nome') if isinstance(row, dict) else None
        if not city_name:
            continue
        if query and query not in city_name.lower():
            continue
        micro = row.get('microrregiao', {}) if isinstance(row, dict) else {}
        meso = micro.get('mesorregiao', {}) if isinstance(micro, dict) else {}
        regiao = meso.get('UF', {}).get('regiao', {}) if isinstance(meso, dict) else {}
        uf_data = meso.get('UF', {}) if isinstance(meso, dict) else {}
        normalized.append(
            {
                'id': row.get('id'),
                'name': city_name,
                'uf': uf_data.get('sigla'),
                'state': uf_data.get('nome'),
                'region': regiao.get('nome'),
                'microregion': micro.get('nome') if isinstance(micro, dict) else None,
                'mesoregion': meso.get('nome') if isinstance(meso, dict) else None,
            }
        )
        if len(normalized) >= int(limit):
            break

    data = {'source': 'ibge-localidades', 'items': normalized}
    shared_cache.set(key, data, ttl=21600)
    return data, False

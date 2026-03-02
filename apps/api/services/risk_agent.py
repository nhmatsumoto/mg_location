import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class RiskAgentError(Exception):
    pass


def fetch_risk_assessment(lat, lon, radius_km=10, grid_size=8):
    base_url = os.getenv('RISK_AGENT_URL', 'http://risk-agent:8091')
    url = f"{base_url.rstrip('/')}/risk-assessment"
    payload = json.dumps({'lat': lat, 'lon': lon, 'radius_km': radius_km, 'grid_size': grid_size}).encode('utf-8')

    request = Request(url, data=payload, method='POST', headers={'Content-Type': 'application/json'})
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode('utf-8'))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RiskAgentError(str(exc)) from exc

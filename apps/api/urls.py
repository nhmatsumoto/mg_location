from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.api.views import (
    auth,
    core,
    disasters,
    hubs,
    integrations,
    modules,
    operations,
    simulation,
    splat,
    sync,
    risk,
)

app_name = 'api'

urlpatterns = [
    # Core / Health
    path('health', core.health_check, name='health_check'),
    path('calculate', core.calculatecoordinate, name='coordinate_calculate'),

    # Auth
    path('auth/register', auth.auth_register, name='auth_register'),
    path('auth/login', auth.auth_login, name='auth_login'),
    path('auth/me', auth.auth_me, name='auth_me'),
    path('auth/logout', auth.auth_logout, name='auth_logout'),
    path('auth/session-login', auth.login_view, name='auth_session_login'),
    path('auth/session-logout', auth.logout_view, name='auth_session_logout'),
    path('auth/session', auth.session_view, name='auth_session'),
    path('auth/google', auth.google_oauth2_login_view, name='auth_google'),
    path('auth/keycloak', auth.keycloak_sso_login_view, name='auth_keycloak'),

    # Incidents / Modules
    path('incidents', modules.incidents_collection, name='incidents_collection'),
    path('incidents/<int:incident_id>', modules.incident_detail, name='incident_detail'),
    path('incidents/<int:incident_id>/support/campaigns', modules.support_campaigns, name='support_campaigns'),
    path('incidents/<int:incident_id>/support/donations/money', modules.support_donations, name='support_donations'),
    path('incidents/<int:incident_id>/support/expenses', modules.support_expenses, name='support_expenses'),
    path('incidents/<int:incident_id>/rescue/search-areas', modules.rescue_search_areas, name='rescue_search_areas'),
    path('incidents/<int:incident_id>/rescue/search-areas/<int:area_id>', modules.rescue_search_area_update, name='rescue_search_area_update'),
    path('incidents/<int:incident_id>/rescue/assignments', modules.rescue_assignments, name='rescue_assignments'),
    
    # Public views
    path('public/incidents', modules.public_incidents, name='public_incidents'),
    path('public/incidents/<int:incident_id>/snapshot/latest', modules.public_latest_snapshot, name='public_latest_snapshot'),
    path('public/incidents/<int:incident_id>/support/summary', modules.public_support_summary, name='public_support_summary'),
    path('public/incidents/<int:incident_id>/rescue/search-areas', modules.public_search_areas, name='public_search_areas'),

    # Disasters
    path('disasters/events', disasters.disasters_events, name='disasters_events'),
    path('disasters/stats/by-country', disasters.disasters_by_country, name='disasters_by_country'),
    path('disasters/stats/timeseries', disasters.disasters_timeseries, name='disasters_timeseries'),
    path('disasters/crawl', disasters.disasters_crawl_trigger, name='disasters_crawl_trigger'),

    # Operations / Map
    path('hotspots', simulation.hotspots, name='hotspots'),
    path('collapse-reports', simulation.collapse_reports, name='collapse_reports'),
    path('rescue-support', simulation.rescue_support, name='rescue_support'),
    path('location/flow-simulation', simulation.location_flow_simulation, name='location_flow_simulation'),
    path('location/flow-simulation/stream', simulation.location_flow_simulation_stream, name='location_flow_simulation_stream'),
    path('simulation/easy', simulation.unified_easy_simulation, name='unified_easy_simulation'),
    path('splat/convert', simulation.splat_convert, name='splat_convert'),

    path('searched-areas', operations.searched_areas, name='searched_areas'),
    path('report-info', operations.report_info, name='report_info'),
    path('missing-people.csv', operations.missing_people_csv, name='missing_people_csv'),
    path('missing-persons', operations.missing_persons, name='missing_persons'),
    path('news-updates', integrations.news_updates, name='news_updates'),
    path('identify-victim', operations.identify_victim, name='identify_victim'),
    path('push/register', operations.push_register, name='push_register'),
    path('attention-alerts', operations.attention_alerts, name='attention_alerts'),
    path('operations/snapshot', operations.operations_snapshot, name='operations_snapshot'),
    path('map-annotations', operations.map_annotations, name='map_annotations'),
    path('support-points', operations.support_points, name='support_points'),
    path('risk-areas', operations.risk_areas, name='risk_areas'),
    path('rescue-groups', operations.rescue_groups, name='rescue_groups'),
    path('supply-logistics', operations.supply_logistics, name='supply_logistics'),
    
    # Risk
    path('risk/assessment', risk.risk_assessment, name='risk_assessment'),
    path('risk/pipeline-sync', risk.risk_pipeline_sync, name='risk_pipeline_sync'),

    # Integrations
    path('climate/integrations', integrations.climate_integrations, name='climate_integrations'),
    path('terrain/context', integrations.terrain_context, name='terrain_context'),
    path('cfd/ideas', integrations.cfd_ideas, name='cfd_ideas'),
    
    path('weather/forecast', integrations.weather_forecast, name='weather_forecast'),
    path('weather', integrations.weather_nowcast, name='weather_nowcast'),
    path('integrations/weather/forecast', integrations.weather_forecast, name='integrations_weather_forecast'),
    path('weather/archive', integrations.weather_archive, name='weather_archive'),
    path('integrations/weather/archive', integrations.weather_archive, name='integrations_weather_history'),
    path('alerts', integrations.alerts, name='alerts_feed'),
    path('integrations/alerts', integrations.alerts, name='integrations_alerts'),
    path('alerts/intelligence', integrations.disaster_intelligence, name='disaster_intelligence'),
    path('transparency/transfers', integrations.transparency_transfers, name='transparency_transfers'),
    path('integrations/transparency/transfers', integrations.transparency_transfers, name='integrations_transparency_transfers'),
    path('transparency/search', integrations.transparency_search, name='transparency_search'),
    path('integrations/transparency/summary', integrations.transparency_summary, name='integrations_transparency_summary'),
    path('integrations/ibge/municipios', integrations.ibge_municipios, name='integrations_ibge_municipios'),
    path('satellite/layers', integrations.satellite_layers, name='satellite_layers'),
    path('integrations/satellite/layers', integrations.satellite_layers, name='integrations_satellite_layers'),
    path('integrations/satellite/landsat/catalog', integrations.satellite_landsat_catalog, name='integrations_satellite_landsat_catalog'),
    path('integrations/satellite/gee/analysis', operations.gee_analysis, name='integrations_gee_analysis'),
    path('satellite/stac/search', integrations.satellite_stac_search, name='satellite_stac_search'),
    path('satellite/goes/recent', integrations.satellite_goes_recent, name='satellite_goes_recent'),

    # Sync
    path('sync', sync.sync_events, name='sync_events'),
    path('events', sync.list_domain_events, name='list_domain_events'),
    
    # Hubs
    path('hubs', hubs.hub_list, name='hub_list'),
    path('hubs/register', hubs.hub_register, name='hub_register'),
]

router = DefaultRouter(trailing_slash=False)
router.register(r'simulations/areas', simulation.SimulationAreaViewSet, basename='simulation-area')
router.register(r'simulations/scenarios', simulation.ScenarioBundleViewSet, basename='simulation-scenario')
router.register(r'simulations/runs', simulation.SimulationRunViewSet, basename='simulation-run')
router.register(r'splats', splat.SplatAssetViewSet, basename='splat-asset')

urlpatterns += router.urls

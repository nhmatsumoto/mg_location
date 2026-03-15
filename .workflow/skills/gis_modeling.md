# GIS & City Modeling Skill

## Purpose
Pattern for integrating professional GIS data (OSM, USGS, Copernicus) into the SOS LOCATION platform.

## Data Schema (GeoCentral)
- **SoilData**: `lat, lng, type (clay, sandy, silty), stability_index, moisture_content`.
- **ClimateData**: `lat, lng, temp, precip_rate, wind_vec, pressure`.
- **TopoData**: `lat, lng, elevation, slope, aspect`.
- **Infrastructure**: `id, type (building, road, power), footprint_geojson, height`.

## Integration Workflow
1. **Normalization**: Convert disparate GIS source formats (GeoTIFF, Shapefiles, GeoJSON) into optimized binary chunks (Protobuf/FlatBuffers).
2. **Spatial Indexing**: Use R-trees or Quadtrees for fast spatial queries in the Integration Service.
3. **Leaflet Bridge**: Synchronize WebGL viewport with Leaflet's zoom/pan state using pixel-to-coord projections.

## Standards
- Use EPSG:4326 (WGS 84) as the base coordinate system.
- Implement 3D extrusion logic for city buildings based on public height data.
- Maintain a local spatial cache to minimize external GIS API latency.

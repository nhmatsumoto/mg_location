import logging

logger = logging.getLogger(__name__)

class TerrainExtractor:
    """
    MVP Terrain Extractor.
    In the future: download SRTM / ALOS map data via an external provider API or Cesium ion.
    For this MVP, it generates a simple flat deterministic heightfield with a slope, scaled by the Bounding Box.
    """
    def __init__(self, bbox):
        self.bbox_min_lat = bbox.get('min_lat')
        self.bbox_min_lng = bbox.get('min_lng')
        self.bbox_max_lat = bbox.get('max_lat')
        self.bbox_max_lng = bbox.get('max_lng')

    def extract(self):
        logger.info(f"Extracting terrain for BBOX: {self.bbox_min_lat},{self.bbox_min_lng} to {self.bbox_max_lat},{self.bbox_max_lng}")
        # MVP: Mock a 100x100 grid heightfield returning base elevation 0
        grid_size = 100
        heightfield = [[0.0 for _ in range(grid_size)] for _ in range(grid_size)]
        
        # Add a gentle slope
        for i in range(grid_size):
            for j in range(grid_size):
                heightfield[i][j] = (i * 0.1) + (j * 0.05)
                
        # Return path to file or the serialized grid
        return {
            "source": "stub_terrain_engine",
            "resolution_m": 10,
            "grid_size": grid_size,
            "data": heightfield
        }


class BuiltEnvironmentExtractor:
    """
    MVP Built Environment Extractor.
    Uses Overpass API (OSM) to fetch building footprints if a Bounding Box is small enough.
    In the future: Integrate with PLATEAU 3D Buildings via Cesium.
    """
    def __init__(self, bbox):
        self.bbox_min_lat = bbox.get('min_lat')
        self.bbox_min_lng = bbox.get('min_lng')
        self.bbox_max_lat = bbox.get('max_lat')
        self.bbox_max_lng = bbox.get('max_lng')

    def extract(self):
        logger.info(f"Extracting Buildings (OSM) for BBOX: {self.bbox_min_lat},{self.bbox_min_lng} to {self.bbox_max_lat},{self.bbox_max_lng}")
        
        # We will stub the Overpass API for now so it doesn't block local development with rate limits.
        # In a real scenario, we do a requests.post to https://overpass-api.de/api/interpreter
        
        mock_buildings = [
            {"id": "osm_1", "type": "building", "geometry": {"type": "Polygon", "coordinates": [[[self.bbox_min_lng + 0.0001, self.bbox_min_lat + 0.0001], [self.bbox_min_lng + 0.0002, self.bbox_min_lat + 0.0001], [self.bbox_min_lng + 0.0002, self.bbox_min_lat + 0.0002], [self.bbox_min_lng + 0.0001, self.bbox_min_lat + 0.0002]]]}, "height": 10.0},
            {"id": "osm_2", "type": "building", "geometry": {"type": "Polygon", "coordinates": [[[self.bbox_min_lng + 0.0003, self.bbox_min_lat + 0.0003], [self.bbox_min_lng + 0.0004, self.bbox_min_lat + 0.0003], [self.bbox_min_lng + 0.0004, self.bbox_min_lat + 0.0004], [self.bbox_min_lng + 0.0003, self.bbox_min_lat + 0.0004]]]}, "height": 25.0}
        ]
        
        return {
            "source": "stub_osm_overpass",
            "features": mock_buildings
        }


class FloodEngine:
    """
    MVP Flood Engine.
    Given a terrain heightfield, buildings, and parameters (starting water level, rainfall),
    calculates a deterministic water depth grid.
    """
    def __init__(self, terrain_data, buildings_data, water_level_start, rainfall_mm, duration_hours):
        self.terrain_grid = terrain_data.get('data', [])
        self.grid_size = terrain_data.get('grid_size', 0)
        self.buildings = buildings_data.get('features', [])
        self.water_level_start = water_level_start
        self.rainfall_mm = rainfall_mm
        self.duration_hours = duration_hours

    def run(self):
        logger.info(f"Running deterministic FloodEngine for grid {self.grid_size}x{self.grid_size} with {self.rainfall_mm}mm rain")
        
        # Absolute simplest physics ever:
        # Final water level = Start Level + (Rainfall_mm / 1000.0)
        water_elevation = self.water_level_start + (self.rainfall_mm / 1000.0)
        
        depth_grid = [[0.0 for _ in range(self.grid_size)] for _ in range(self.grid_size)]
        flooded_area_cells = 0
        total_volume = 0.0
        
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                terrain_height = self.terrain_grid[i][j]
                
                # Check for building intersection (MVP: just adding small height to building cells)
                # For this MVP, we ignore buildings' precise polygon intersection in the Python layer,
                # focusing on the terrain filling up.
                
                if water_elevation > terrain_height:
                    depth = water_elevation - terrain_height
                    depth_grid[i][j] = depth
                    flooded_area_cells += 1
                    total_volume += depth
        
        # Mock metrics
        num_buildings_affected = len(self.buildings) if flooded_area_cells > (self.grid_size**2 * 0.5) else 0

        return {
            "depth_grid": depth_grid,
            "metrics": {
                "max_water_elevation": water_elevation,
                "flooded_cells": flooded_area_cells,
                "total_water_volume": total_volume,
                "buildings_affected": num_buildings_affected
            }
        }


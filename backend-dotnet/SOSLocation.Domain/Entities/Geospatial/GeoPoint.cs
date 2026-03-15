namespace SOSLocation.Domain.Entities.Geospatial
{
    public class GeoPoint
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public SoilInfo Soil { get; set; } = null!;
        public ClimateInfo Climate { get; set; } = null!;
        public TopoInfo Topography { get; set; } = null!;
        public UrbanInfo Urban { get; set; } = null!;
    }

    public class SoilInfo
    {
        public string Type { get; set; } = null!; // clay, sandy, silty
        public double StabilityIndex { get; set; }
        public double MoistureContent { get; set; }
    }

    public class ClimateInfo
    {
        public double Temperature { get; set; }
        public double PrecipitationRate { get; set; }
        public double WindSpeed { get; set; }
        public double WindDirection { get; set; }
        public double Pressure { get; set; }
        public double MoistureContent { get; set; }
    }

    public class TopoInfo
    {
        public double Elevation { get; set; }
        public double Slope { get; set; }
        public double Aspect { get; set; }
    }

    public class UrbanInfo
    {
        public List<BuildingData> Buildings { get; set; } = new();
        public List<InfrastructureData> Infrastructure { get; set; } = new();
        public List<VegetationData> Vegetation { get; set; } = new();
    }

    public class BuildingData
    {
        public long Id { get; set; }
        public List<double[]> Coordinates { get; set; } = new();
        public double Height { get; set; }
        public int Levels { get; set; }
        public string Usage { get; set; } = "residential"; // commercial, industrial, etc.
        public string Material { get; set; } = "concrete";
    }

    public class InfrastructureData
    {
        public long Id { get; set; }
        public List<double[]> Coordinates { get; set; } = new();
        public string Type { get; set; } = null!; // road, bridge, tunnel
        public string PavementType { get; set; } = "asphalt"; // asphalt, concrete, gravel
        public int Lanes { get; set; } = 2;
    }

    public class VegetationData
    {
        public long Id { get; set; }
        public List<double[]> Coordinates { get; set; } = new();
        public string Type { get; set; } = "forest"; // grass, park, tree
        public double Density { get; set; }
    }
}

using System.Collections.Generic;

namespace SOSLocation.Application.DTOs.Gis
{
    public class TerrainElevationDto
    {
        public string Source { get; set; } = "SRTM GL3 / OpenTopography";
        public int Resolution { get; set; }
        public List<List<float>> Grid { get; set; } = [];
    }
}

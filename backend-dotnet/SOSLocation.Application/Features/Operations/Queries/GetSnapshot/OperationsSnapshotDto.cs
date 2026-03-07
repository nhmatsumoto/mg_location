using MediatR;
using SOSLocation.Application.DTOs.Alerts;
using SOSLocation.Application.DTOs.Incidents;
using System;
using System.Collections.Generic;

namespace SOSLocation.Application.Features.Operations.Queries.GetSnapshot
{
    public record GetOperationsSnapshotQuery : IRequest<OperationsSnapshotDto>;

    public class OperationsSnapshotDto
    {
        public DateTime GeneratedAtUtc { get; set; }
        public OperationsKpis Kpis { get; set; } = new();
        public OperationsLayers Layers { get; set; } = new();
    }

    public class OperationsKpis
    {
        public int CriticalAlerts { get; set; }
        public int ActiveTeams { get; set; }
        public double Rain24hMm { get; set; }
        public int SuppliesInTransit { get; set; }
    }

    public class OperationsLayers
    {
        public IEnumerable<AlertDto> AttentionAlerts { get; set; } = [];
        public IEnumerable<IncidentDto> Incidents { get; set; } = [];
        // Add other layers as needed
    }
}

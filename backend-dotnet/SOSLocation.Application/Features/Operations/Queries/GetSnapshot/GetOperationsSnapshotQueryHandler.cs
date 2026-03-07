using MediatR;
using SOSLocation.Application.DTOs.Alerts;
using SOSLocation.Application.DTOs.Incidents;
using SOSLocation.Domain.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Application.Features.Operations.Queries.GetSnapshot
{
    public class GetOperationsSnapshotQueryHandler : IRequestHandler<GetOperationsSnapshotQuery, OperationsSnapshotDto>
    {
        private readonly IIncidentRepository _incidentRepository;
        private readonly IAttentionAlertRepository _alertRepository;
        private readonly IRescueGroupRepository _rescueGroupRepository;
        private readonly ISupplyLogisticsRepository _supplyRepository;

        public GetOperationsSnapshotQueryHandler(
            IIncidentRepository incidentRepository,
            IAttentionAlertRepository alertRepository,
            IRescueGroupRepository rescueGroupRepository,
            ISupplyLogisticsRepository supplyRepository)
        {
            _incidentRepository = incidentRepository;
            _alertRepository = alertRepository;
            _rescueGroupRepository = rescueGroupRepository;
            _supplyRepository = supplyRepository;
        }

        public async Task<OperationsSnapshotDto> Handle(GetOperationsSnapshotQuery request, CancellationToken cancellationToken)
        {
            var incidents = await _incidentRepository.GetAllAsync();
            var alerts = await _alertRepository.GetAllAsync();
            var rescueGroups = await _rescueGroupRepository.GetAllAsync();
            var supplies = await _supplyRepository.GetAllAsync();

            return new OperationsSnapshotDto
            {
                GeneratedAtUtc = DateTime.UtcNow,
                Kpis = new OperationsKpis
                {
                    CriticalAlerts = alerts.Count(a => a.Severity == "high" || a.Severity == "critical"),
                    ActiveTeams = rescueGroups.Count(g => g.Status == "pronto" || g.Status == "em_campo"),
                    SuppliesInTransit = supplies.Count(s => s.Status == "em_transporte")
                },
                Layers = new OperationsLayers
                {
                    Incidents = incidents.Select(i => new IncidentDto { Id = i.Id, Name = i.Name, Status = i.Status }),
                    AttentionAlerts = alerts.Select(a => new AlertDto { Id = a.Id, Title = a.Title, Severity = a.Severity })
                }
            };
        }
    }
}

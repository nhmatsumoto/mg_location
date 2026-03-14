using MediatR;
using SOSLocation.Application.DTOs.Incidents;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Domain.Incidents;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace SOSLocation.Application.Features.Operations.Queries.GetSnapshot
{
    public class GetOperationsSnapshotQuery : IRequest<OperationsSnapshotDto> { }

    public class GetOperationsSnapshotQueryHandler : IRequestHandler<GetOperationsSnapshotQuery, OperationsSnapshotDto>
    {
        private readonly IIncidentRepository _incidentRepo;
        private readonly IAttentionAlertRepository _alertRepo;
        private readonly IRescueGroupRepository _rescueRepo;
        private readonly ISupplyLogisticsRepository _supplyRepo;

        public GetOperationsSnapshotQueryHandler(
            IIncidentRepository incidentRepo,
            IAttentionAlertRepository alertRepo,
            IRescueGroupRepository rescueRepo,
            ISupplyLogisticsRepository supplyRepo)
        {
            _incidentRepo = incidentRepo;
            _alertRepo = alertRepo;
            _rescueRepo = rescueRepo;
            _supplyRepo = supplyRepo;
        }

        public async Task<OperationsSnapshotDto> Handle(GetOperationsSnapshotQuery request, CancellationToken cancellationToken)
        {
            var totalIncidents = await _incidentRepo.GetCountAsync(cancellationToken);
            var totalAlerts = await _alertRepo.GetCountAsync(null, cancellationToken);
            var criticalAlerts = await _alertRepo.GetCountAsync("Critical", cancellationToken);
            
            var rescueStats = new 
            {
                Ready = await _rescueRepo.GetCountByStatusAsync(cancellationToken, "pronto", "em_deslocamento"),
                Active = await _rescueRepo.GetCountByStatusAsync(cancellationToken, "em_operacao")
            };

            var logisticsStats = new
            {
                Pending = await _supplyRepo.GetCountByStatusAsync("planejado", cancellationToken),
                InProgress = await _supplyRepo.GetCountByStatusAsync("em_transito", cancellationToken)
            };

            return new OperationsSnapshotDto
            {
                GeneratedAtUtc = DateTime.UtcNow,
                Kpis = new OperationsKpis
                {
                    CriticalAlerts = criticalAlerts,
                    ActiveTeams = rescueStats.Ready + rescueStats.Active,
                    SuppliesInTransit = logisticsStats.Pending + logisticsStats.InProgress
                }
            };
        }
    }
}

using MediatR;
using SOSLocation.Application.DTOs.Incidents;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Domain.Incidents;
using SOSLocation.Domain.Missions;
using SOSLocation.Domain.Tracking;
using SOSLocation.Domain.Shared;
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
            var totalIncidents = await _incidentRepo.GetCountAsync();
            var totalAlerts = await _alertRepo.GetCountAsync();
            var criticalAlerts = await _alertRepo.GetCountAsync("Critical");
            
            var rescueStats = new 
            {
                Ready = await _rescueRepo.GetCountByStatusAsync("pronto", "em_deslocamento"),
                Active = await _rescueRepo.GetCountByStatusAsync("em_operacao")
            };

            var logisticsStats = new
            {
                Pending = await _supplyRepo.GetCountByStatusAsync("planejado"),
                InProgress = await _supplyRepo.GetCountByStatusAsync("em_transito")
            };

            return new OperationsSnapshotDto
            {
                TotalIncidents = totalIncidents,
                TotalAlerts = totalAlerts,
                CriticalAlerts = criticalAlerts,
                ActiveRescueGroups = rescueStats.Ready + rescueStats.Active,
                PendingLogistics = logisticsStats.Pending + logisticsStats.InProgress,
                Timestamp = DateTime.UtcNow
            };
        }
    }
}

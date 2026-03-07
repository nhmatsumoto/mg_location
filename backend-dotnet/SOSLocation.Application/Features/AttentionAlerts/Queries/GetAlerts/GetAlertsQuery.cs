using MediatR;
using SOSLocation.Application.DTOs.Alerts;
using SOSLocation.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Application.Features.AttentionAlerts.Queries.GetAlerts
{
    public record GetAlertsQuery : IRequest<IEnumerable<AlertDto>>;

    public class GetAlertsQueryHandler : IRequestHandler<GetAlertsQuery, IEnumerable<AlertDto>>
    {
        private readonly IAttentionAlertRepository _repository;

        public GetAlertsQueryHandler(IAttentionAlertRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<AlertDto>> Handle(GetAlertsQuery request, CancellationToken cancellationToken)
        {
            var alerts = await _repository.GetAllAsync();
            return alerts.Select(a => new AlertDto
            {
                Id = a.Id,
                ExternalId = a.ExternalId,
                Title = a.Title,
                Message = a.Message,
                Severity = a.Severity,
                Lat = a.Lat,
                Lng = a.Lng,
                RadiusMeters = a.RadiusMeters,
                IncidentId = a.IncidentId
            });
        }
    }
}

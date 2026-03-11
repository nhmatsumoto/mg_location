using MediatR;
using SOSLocation.Application.DTOs.Incidents;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Domain.Incidents;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Application.Features.Incidents.Queries.GetIncidents
{
    public record GetIncidentsQuery : IRequest<IEnumerable<IncidentDto>>;

    public class GetIncidentsQueryHandler : IRequestHandler<GetIncidentsQuery, IEnumerable<IncidentDto>>
    {
        private readonly IIncidentRepository _repository;

        public GetIncidentsQueryHandler(IIncidentRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<IncidentDto>> Handle(GetIncidentsQuery request, CancellationToken cancellationToken)
        {
            var incidents = await _repository.GetAllAsync();
            return incidents.Select(i => new IncidentDto
            {
                Id = i.Id,
                Name = i.Name,
                Type = i.Type,
                Status = i.Status,
                Country = i.Country,
                Region = i.Region,
                StartsAt = i.StartsAt,
                EndsAt = i.EndsAt
            });
        }
    }
}

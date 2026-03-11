using MediatR;
using SOSLocation.Domain.Missions;
using SOSLocation.Domain.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace SOSLocation.Application.Features.Rescue.Commands.CreateSearchArea
{
    public class CreateSearchAreaCommandHandler : IRequestHandler<CreateSearchAreaCommand, Guid>
    {
        private readonly ISearchAreaRepository _repository;

        public CreateSearchAreaCommandHandler(ISearchAreaRepository repository)
        {
            _repository = repository;
        }

        public async Task<Guid> Handle(CreateSearchAreaCommand request, CancellationToken cancellationToken)
        {
            var area = new SearchArea
            {
                IncidentId = request.IncidentId,
                Name = request.Name,
                GeometryJson = request.GeometryJson,
                Status = "Pending"
            };

            await _repository.AddAsync(area);
            return area.Id;
        }
    }
}

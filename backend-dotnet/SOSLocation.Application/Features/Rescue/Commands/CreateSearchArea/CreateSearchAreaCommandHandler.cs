using MediatR;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Application.Features.Rescue.Commands.CreateSearchArea
{
    public class CreateSearchAreaCommandHandler : IRequestHandler<CreateSearchAreaCommand, int>
    {
        private readonly ISearchAreaRepository _repository;

        public CreateSearchAreaCommandHandler(ISearchAreaRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> Handle(CreateSearchAreaCommand request, CancellationToken cancellationToken)
        {
            var area = new SearchArea
            {
                ExternalId = Guid.NewGuid(),
                IncidentId = request.IncidentId,
                Name = request.Name,
                GeometryJson = request.GeometryJson,
                Status = request.Status
            };

            return await _repository.AddAsync(area);
        }
    }
}

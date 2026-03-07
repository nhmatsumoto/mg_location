using MediatR;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Application.Features.Logistics.Commands.CreateSupply
{
    public class CreateSupplyCommandHandler : IRequestHandler<CreateSupplyCommand, Guid>
    {
        private readonly ISupplyLogisticsRepository _repository;

        public CreateSupplyCommandHandler(ISupplyLogisticsRepository repository)
        {
            _repository = repository;
        }

        public async Task<Guid> Handle(CreateSupplyCommand request, CancellationToken cancellationToken)
        {
            var supply = new SupplyLogistics
            {
                ExternalId = $"LG-{Guid.NewGuid().ToString().Substring(0, 8)}",
                Item = request.Item,
                Quantity = (int)request.Quantity,
                Unit = request.Unit,
                Origin = request.Origin,
                Destination = request.Destination,
                Status = request.Status,
                Priority = request.Priority
            };

            await _repository.AddAsync(supply);
            return supply.Id;
        }
    }
}

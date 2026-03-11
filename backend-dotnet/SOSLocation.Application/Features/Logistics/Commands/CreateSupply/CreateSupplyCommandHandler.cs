using MediatR;
using SOSLocation.Domain.Missions;
using SOSLocation.Domain.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace SOSLocation.Application.Features.Logistics.Commands.CreateSupply
{
    public record CreateSupplyCommand(string Item, int Quantity, string Unit, string Origin, string Destination, string Priority) : IRequest<Guid>;

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
                Item = request.Item,
                Quantity = request.Quantity,
                Unit = request.Unit,
                Origin = request.Origin,
                Destination = request.Destination,
                Priority = request.Priority,
                Status = "planejado"
            };

            await _repository.AddAsync(supply);
            return supply.Id;
        }
    }
}

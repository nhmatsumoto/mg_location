using FluentValidation;
using MediatR;
using SOSLocation.Application.DTOs.Incidents;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SOSLocation.Application.Features.Incidents.Commands.CreateIncident
{
    public record CreateIncidentCommand(string Name, string Type, string Country, string Region, DateTime StartsAt) : IRequest<int>;

    public class CreateIncidentCommandValidator : AbstractValidator<CreateIncidentCommand>
    {
        public CreateIncidentCommandValidator()
        {
            RuleFor(v => v.Name).NotEmpty().MaximumLength(180);
            RuleFor(v => v.Type).NotEmpty().MaximumLength(80);
            RuleFor(v => v.Country).NotEmpty().MaximumLength(120);
            RuleFor(v => v.Region).NotEmpty().MaximumLength(120);
            RuleFor(v => v.StartsAt).NotEmpty().LessThanOrEqualTo(DateTime.UtcNow);
        }
    }

    public class CreateIncidentCommandHandler : IRequestHandler<CreateIncidentCommand, int>
    {
        private readonly IIncidentRepository _repository;

        public CreateIncidentCommandHandler(IIncidentRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
        {
            var incident = new Incident
            {
                Name = request.Name,
                Type = request.Type,
                Country = request.Country,
                Region = request.Region,
                StartsAt = request.StartsAt,
                Status = "active"
            };

            return await _repository.AddAsync(incident);
        }
    }
}

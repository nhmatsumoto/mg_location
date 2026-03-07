using MediatR;
using System.ComponentModel.DataAnnotations;

namespace SOSLocation.Application.Features.Rescue.Commands.CreateSearchArea
{
    public record CreateSearchAreaCommand : IRequest<int>
    {
        public int IncidentId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string GeometryJson { get; set; } = "{}";
        public string Status { get; set; } = "Pending";
        public string Severity { get; set; } = "Low";
    }
}

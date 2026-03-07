using MediatR;
using Microsoft.AspNetCore.Mvc;
using SOSLocation.Domain.Interfaces;
using System.Threading.Tasks;

namespace SOSLocation.API.Controllers
{
    [ApiController]
    [Route("api/incidents/{incidentId}/support")]
    public class SupportController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICampaignRepository _campaignRepository;
        private readonly IDonationRepository _donationRepository;
        private readonly IExpenseRepository _expenseRepository;

        public SupportController(
            IMediator mediator,
            ICampaignRepository campaignRepository,
            IDonationRepository donationRepository,
            IExpenseRepository expenseRepository)
        {
            _mediator = mediator;
            _campaignRepository = campaignRepository;
            _donationRepository = donationRepository;
            _expenseRepository = expenseRepository;
        }

        [HttpGet("campaigns")]
        public async Task<IActionResult> GetCampaigns(int incidentId)
        {
            return Ok(await _campaignRepository.GetByIncidentIdAsync(incidentId));
        }

        [HttpGet("donations")]
        public async Task<IActionResult> GetDonations(int incidentId)
        {
            return Ok(await _donationRepository.GetByIncidentIdAsync(incidentId));
        }

        [HttpGet("expenses")]
        public async Task<IActionResult> GetExpenses(int incidentId)
        {
            return Ok(await _expenseRepository.GetByIncidentIdAsync(incidentId));
        }
    }
}

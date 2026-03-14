using Dapper;
using SOSLocation.Domain.Entities;
using SOSLocation.Domain.Interfaces;
using SOSLocation.Infrastructure.Persistence.Dapper;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace SOSLocation.Infrastructure.Persistence.Repositories
{
    public class CampaignRepository : ICampaignRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly SOSLocationDbContext _efContext;

        public CampaignRepository(DapperContext dapperContext, SOSLocationDbContext efContext)
        {
            _dapperContext = dapperContext;
            _efContext = efContext;
        }

        public async Task<IEnumerable<Campaign>> GetByIncidentIdAsync(Guid incidentId, CancellationToken ct = default)
        {
            var query = "SELECT * FROM \"Campaigns\" WHERE \"IncidentId\" = @IncidentId";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<Campaign>(new CommandDefinition(query, new { IncidentId = incidentId }, cancellationToken: ct));
        }

        public async Task AddAsync(Campaign campaign, CancellationToken ct = default)
        {
            _efContext.Campaigns.Add(campaign);
            await _efContext.SaveChangesAsync(ct);
        }
    }

    public class DonationRepository : IDonationRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly SOSLocationDbContext _efContext;

        public DonationRepository(DapperContext dapperContext, SOSLocationDbContext efContext)
        {
            _dapperContext = dapperContext;
            _efContext = efContext;
        }

        public async Task<IEnumerable<DonationMoney>> GetByIncidentIdAsync(Guid incidentId, CancellationToken ct = default)
        {
            var query = "SELECT * FROM \"Donations\" WHERE \"IncidentId\" = @IncidentId";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<DonationMoney>(new CommandDefinition(query, new { IncidentId = incidentId }, cancellationToken: ct));
        }

        public async Task AddAsync(DonationMoney donation, CancellationToken ct = default)
        {
            _efContext.Donations.Add(donation);
            await _efContext.SaveChangesAsync(ct);
        }
    }

    public class ExpenseRepository : IExpenseRepository
    {
        private readonly DapperContext _dapperContext;
        private readonly SOSLocationDbContext _efContext;

        public ExpenseRepository(DapperContext dapperContext, SOSLocationDbContext efContext)
        {
            _dapperContext = dapperContext;
            _efContext = efContext;
        }

        public async Task<IEnumerable<Expense>> GetByIncidentIdAsync(Guid incidentId, CancellationToken ct = default)
        {
            var query = "SELECT * FROM \"Expenses\" WHERE \"IncidentId\" = @IncidentId";
            using var connection = _dapperContext.CreateConnection();
            return await connection.QueryAsync<Expense>(new CommandDefinition(query, new { IncidentId = incidentId }, cancellationToken: ct));
        }

        public async Task AddAsync(Expense expense, CancellationToken ct = default)
        {
            _efContext.Expenses.Add(expense);
            await _efContext.SaveChangesAsync(ct);
        }
    }
}

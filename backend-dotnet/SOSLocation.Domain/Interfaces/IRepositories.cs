using SOSLocation.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SOSLocation.Domain.Interfaces
{
    public interface IIncidentRepository
    {
        Task<Incident?> GetByIdAsync(int id);
        Task<IEnumerable<Incident>> GetAllAsync();
        Task<int> AddAsync(Incident incident);
        Task UpdateAsync(Incident incident);
        Task DeleteAsync(int id);
    }

    public interface IAttentionAlertRepository
    {
        Task<IEnumerable<AttentionAlert>> GetAllAsync();
        Task<AttentionAlert?> GetByIdAsync(int id);
        Task<int> AddAsync(AttentionAlert alert);
    }

    public interface IRescueGroupRepository
    {
        Task<IEnumerable<RescueGroup>> GetAllAsync();
        Task<int> AddAsync(RescueGroup group);
    }

    public interface ISupplyLogisticsRepository
    {
        Task<IEnumerable<SupplyLogistics>> GetAllAsync();
        Task<int> AddAsync(SupplyLogistics item);
    }

    public interface ISearchAreaRepository
    {
        Task<IEnumerable<SearchArea>> GetByIncidentIdAsync(int incidentId);
        Task<int> AddAsync(SearchArea area);
        Task UpdateAsync(SearchArea area);
    }

    public interface IAssignmentRepository
    {
        Task<IEnumerable<Assignment>> GetByIncidentIdAsync(int incidentId);
        Task<int> AddAsync(Assignment assignment);
    }

    public interface IHubRepository
    {
        Task<IEnumerable<EdgeHub>> GetAllAsync();
        Task AddAsync(EdgeHub hub);
    }

    public interface ICampaignRepository
    {
        Task<IEnumerable<Campaign>> GetByIncidentIdAsync(int incidentId);
        Task<int> AddAsync(Campaign campaign);
    }

    public interface IDonationRepository
    {
        Task<IEnumerable<DonationMoney>> GetByIncidentIdAsync(int incidentId);
        Task<int> AddAsync(DonationMoney donation);
    }

    public interface IExpenseRepository
    {
        Task<IEnumerable<Expense>> GetByIncidentIdAsync(int incidentId);
        Task<int> AddAsync(Expense expense);
    }

    public interface IGeolocationRepository
    {
        Task<IEnumerable<Geolocation>> GetAllAsync();
        Task<int> AddAsync(Geolocation geolocation);
    }

    public interface IVisitedLocationRepository
    {
        Task<IEnumerable<VisitedLocation>> GetAllAsync();
        Task<int> AddAsync(VisitedLocation location);
    }

    public interface IFoundPeopleRepository
    {
        Task<IEnumerable<FoundPeople>> GetAllAsync();
        Task<int> AddAsync(FoundPeople person);
    }
}

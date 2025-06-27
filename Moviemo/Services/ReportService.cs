using Microsoft.EntityFrameworkCore;
using Moviemo.Data;
using Moviemo.Dtos;
using Moviemo.Dtos.Report;
using Moviemo.Models;
using Moviemo.Services.Interfaces;

namespace Moviemo.Services
{
    public class ReportService : IReportService
    {
        private readonly ILogger<ReportService> _Logger;

        private readonly AppDbContext _Context;

        public ReportService(AppDbContext Context, ILogger<ReportService> Logger)
        {
            _Logger = Logger;
            _Context = Context;
        }

        public async Task<List<ReportGetDto>?> GetAllAsync()
        {
            _Logger.LogInformation("All report information is received...");

            try
            {
                return await _Context.Reports
                .Include(R => R.User)
                .Select(R => new ReportGetDto
                {
                    Id = R.Id,
                    UserId = R.User.Id,
                    Title = R.Title,
                    Details = R.Details,
                    CreatedAt = R.CreatedAt
                })
                .ToListAsync();
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred during receiving all report information.");
                return null;
            }
        }

        public async Task<ReportGetDto?> GetByIdAsync(long Id)
        {
            _Logger.LogInformation("The report information with ID {Id} is being retrieved....", Id);

            try
            {
                return await _Context.Reports
                .Include(R => R.User)
                .Select(R => new ReportGetDto
                {
                    Id = R.Id,
                    UserId = R.User.Id,
                    Title = R.Title,
                    Details = R.Details,
                    CreatedAt = R.CreatedAt
                })
                .FirstOrDefaultAsync(R => R.Id == Id);
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred during the report information.");
                return null;
            }
        }

        public async Task<ReportCreateDto?> CreateAsync(ReportCreateDto Dto, long UserId)
        {
            _Logger.LogInformation("New report is being created: {@ReportCreateDto}", Dto);

            try
            {
                var Report = new Report
                {
                    UserId = UserId,
                    Title = Dto.Title,
                    Details = Dto.Details
                };

                await _Context.Reports.AddAsync(Report);
                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The report was created successfully.");

                return Dto;
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred when creating a report.");
                return null;
            }
        }

        public async Task<UpdateResponseDto?> UpdateAsync(long Id, long UserId, ReportUpdateDto Dto)
        {
            _Logger.LogInformation("Updating report with ID {Id}: {@ReportUpdateDto}", Id , Dto);

            try
            {
                var Report = await _Context.Reports.FindAsync(Id);

                if (Report == null)
                    return new UpdateResponseDto { Issue = UpdateIssue.NotFound };

                if (Report.UserId !=  UserId)
                    return new UpdateResponseDto { Issue = UpdateIssue.NotOwner };

                var DtoProperties = Dto.GetType().GetProperties();
                var ReportType = Report.GetType();

                foreach (var Property in DtoProperties)
                {
                    var NewValue = Property.GetValue(Dto);
                    if (NewValue == null) continue;

                    var TargetProperty = ReportType.GetProperty(Property.Name);
                    if (TargetProperty == null || !TargetProperty.CanWrite) continue;

                    TargetProperty.SetValue(Report, NewValue);
                }

                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The report with ID {Id} has been successfully updated.", Id);

                return new UpdateResponseDto { IsUpdated = true };
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred during the report updating.");
                return null;
            }
        }

        public async Task<DeleteResponseDto?> DeleteAsync(long Id, long UserId)
        {
            _Logger.LogInformation("Deleting report with ID {Id}...", Id);

            try
            {
                var Report = await _Context.Reports.FindAsync(Id);

                if (Report == null)
                    return new DeleteResponseDto { Issue = DeleteIssue.NotFound };

                if (Report.UserId != UserId)
                    return new DeleteResponseDto { Issue = DeleteIssue.NotOwner };

                _Context.Reports.Remove(Report);
                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The report with ID {Id} has been successfully deleted..", Id);

                return new DeleteResponseDto { IsDeleted = true };
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred when deleting the report.");
                return null;
            }
        }
    }
}

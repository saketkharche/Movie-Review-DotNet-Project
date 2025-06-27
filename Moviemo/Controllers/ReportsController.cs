using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moviemo.Dtos;
using Moviemo.Dtos.Report;
using Moviemo.Services.Interfaces;

namespace Moviemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _ReportService;

        public ReportsController(IReportService ReportService)
        {
            _ReportService = ReportService;
        }

        // api/reports -> Tüm rapor bilgilerini al
        [Authorize(Roles = "Manager")]
        [HttpGet]
        public async Task<IActionResult> GetAllReports()
        {
            var Reports = await _ReportService.GetAllAsync();

            if (Reports == null)
                return StatusCode(500, "A server error occurred while receiving all report information.");

            return Ok(Reports);
        }

        // api/reports/{Id} -> Rotada belirtilen ID'ye sahip rapor bilgisini al
        [Authorize(Roles = "Manager")]
        [HttpGet("{Id}")]
        public async Task<IActionResult> GetReportById(long Id)
        {
            var Report = await _ReportService.GetByIdAsync(Id);

            if (Report == null) 
                return NotFound();

            return Ok(Report);
        }

        // api/reports -> Rapor oluştur
        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] ReportCreateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Evaluating User Token Information.");

            var Report = await _ReportService.CreateAsync(Dto, UserId);

            if (Report == null)
                return StatusCode(500, "A server error occurred while creating a report.");

            return Ok(Dto);
        }

        // api/reports/{Id} -> Rotada belirtilen ID'ye sahip raporu güncelle
        [Authorize(Roles = "Manager")]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateReport(long Id, ReportUpdateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Evaluating User Token Information.");

            var ResponseDto = await _ReportService.UpdateAsync(Id, UserId, Dto);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while updating the report.");

            if (ResponseDto.IsUpdated) return Ok(Dto);

            return ResponseDto.Issue switch
            { 
                UpdateIssue.NotFound => NotFound($"The report with ID {Id} was not found."),
                UpdateIssue.NotOwner => Unauthorized("You cannot update a review that does not belong to you. "),
                _ => BadRequest("The report could not be performed.")
            };
        }

        // api/reports/{Id} -> Rotada belirtilen ID'ye sahip raporu sil}
        [Authorize(Roles = "Manager")]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteReport(long Id)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Evaluating User Token Information.");

            var ResponseDto = await _ReportService.DeleteAsync(Id, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while deleting the report.");

            if (ResponseDto.IsDeleted) return NoContent();

            return ResponseDto.Issue switch
            {
                DeleteIssue.NotFound => NotFound($"The report with ID {Id} was not found."),
                DeleteIssue.NotOwner => Unauthorized("You cannot delete a review that does not belong to you."),
                _ => BadRequest("The report deletion could not be performed.")
            };
        }
    }
}

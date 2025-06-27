using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moviemo.Dtos;
using Moviemo.Dtos.Review;
using Moviemo.Services.Interfaces;

namespace Moviemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _ReviewService;

        public ReviewsController(IReviewService ReviewService)
        {
            // Yapıcı metot bağımlılık enjeksiyonu
            _ReviewService = ReviewService;
        }

        // api/reviews -> Tüm inceleme bilgilerini al
        [HttpGet]
        public async Task<IActionResult> GetAllReviews([FromQuery] long? MovieId)
        {
            var Reviews = new List<ReviewGetDto> { };

            if (MovieId != null)
            {
                Reviews = await _ReviewService.GetByMovieIdAsync(MovieId);

            }
            else
            {
                Reviews = await _ReviewService.GetAllAsync();
            }

            if (Reviews == null)
                return StatusCode(500, "An error occurred when receiving all report information");

            return Ok(Reviews);
        }

        // api/reviews/{Id} -> Rotada belirtilen ID'ye sahip inceleme bilgilerini al
        [HttpGet("{Id}")]
        public async Task<IActionResult> GetReviewById(long Id)
        {
            var Review = await _ReviewService.GetByIdAsync(Id);

            if (Review == null) return NotFound();

            return Ok(Review);
        }

        // api/reviews -> İnceleme oluştur
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReview([FromBody] ReviewCreateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Evaluating User Token Information.");

            var ResponseDto = await _ReviewService.CreateAsync(Dto, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred during the investigation.");

            return Ok(ResponseDto);
        }

        // api/reviews/{Id} -> Rotada belirtilen ID'ye sahip incelemeyi güncelle
        [Authorize]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateReview(long Id, [FromBody] ReviewUpdateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Evaluating User Token Information.");

            var ResponseDto = await _ReviewService.UpdateAsync(Id, UserId, Dto);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while the review was updated.");

            if (ResponseDto.IsUpdated) return Ok(Dto);

            return ResponseDto.Issue switch
            {
                UpdateIssue.NotFound => NotFound($"The review with ID {Id} was not found."),
                UpdateIssue.NotOwner => Unauthorized("You cannot update a review that does not belong to you."),
                _ => BadRequest("The review could not be performed.")
            };
        }

        // api/reviews/{Id} -> Rotada belirtilen ID'ye sahip incelemeyi sil
        [Authorize]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteReview(long Id)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Evaluating User Token Information.");

            var ResponseDto = await _ReviewService.DeleteAsync(Id, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred when the review was deleted.");

            if (ResponseDto.IsDeleted) return NoContent();

            return ResponseDto.Issue switch
            { 
                DeleteIssue.NotFound => NotFound($"The review with ID {Id} was not found."),
                DeleteIssue.NotOwner => Unauthorized("You cannot delete a review that does not belong to you."),
                _ => BadRequest("Review deletion could not be performed.")
            };
        }
    }
}

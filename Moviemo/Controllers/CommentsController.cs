using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moviemo.Dtos;
using Moviemo.Dtos.Comment;
using Moviemo.Services.Interfaces;

namespace Moviemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _CommentService;

        public CommentsController(ICommentService CommentService)
        {
            // Yapıcı metot bağımlılık enjeksiyonu
            _CommentService = CommentService;
        }

        // api/comments -> Tüm yorum bilgilerini al
        [HttpGet]
        public async  Task<IActionResult> GetAllComments([FromQuery] long? MovieId)
        {
            var Comments = new List<CommentGetDto>() { };

            if (MovieId != null)
            {
                Comments = await _CommentService.GetByMovieIdAsync(MovieId);
            } else
            {
                Comments = await _CommentService.GetAllAsync();
            }

            if (Comments == null) 
                return StatusCode(500, "A server error occurred while retrieving all movie information.");

            return Ok(Comments);
        }

        // api/comments/{Id} -> Rotada belirtilen ID'ye sahip yorum bilgilerini al
        [HttpGet("{Id}")]
        public async Task<IActionResult> GetCommentById(long Id)
        {
            var Comment = await _CommentService.GetByIdAsync(Id);

            if (Comment == null) return NotFound();

            return Ok(Comment);
        }

        // api/comments -> Yorum oluştur
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody] CommentCreateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Geçersiz kullanıcı token bilgisi.");

            var Comment = await _CommentService.CreateAsync(Dto, UserId);

            if (Comment == null) return StatusCode(500, "A server error occurred while creating the comment");

            return Ok(Comment);
        }

        // api/comments/{Id} -> Rotada belirtilen ID'ye sahip yorumu güncelle
        [Authorize]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateComment(long Id, [FromBody] CommentUpdateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid user token information.");

            var ResponseDto = await _CommentService.UpdateAsync(Id, UserId, Dto);

            if (ResponseDto == null) 
                return StatusCode(500, "A server error occurred while updating the comment.");

            if (ResponseDto.IsUpdated)
                return Ok(Dto);

            return ResponseDto.Issue switch
            {
                UpdateIssue.NotFound => NotFound($"The comment with ID {Id} was not found."),
                UpdateIssue.NotOwner => Unauthorized("You cannot update a comment that doesn't belong to you."),
                _ => BadRequest("The comment update operation could not be performed.")
            };
        }

        // api/comments/{Id} -> Rotada belirtilen ID'ye sahip yorumu sil
        [Authorize]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteComment(long Id)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid user token information.");

            var ResponseDto = await _CommentService.DeleteAsync(Id, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while deleting the comment.");

            if (ResponseDto.IsDeleted) return NoContent();

            return ResponseDto.Issue switch
            {
                DeleteIssue.NotFound => NotFound("No comment found to be deleted."),
                DeleteIssue.NotOwner => Unauthorized("You cannot delete a comment that does not belong to you."),
                _ => BadRequest("Comment deletion could not be performed.")
            };
        }
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Moviemo.Dtos;
using Moviemo.Dtos.Vote;
using Moviemo.Services.Interfaces;

namespace Moviemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VotesController : ControllerBase
    {
        private readonly IVoteService _VoteService;

        public VotesController(IVoteService VoteService)
        {
            _VoteService = VoteService;
        }

        // api/votes 
        [HttpGet]
        public async Task<IActionResult> GetAllVotes([FromQuery] long? UserId, [FromQuery] long? CommentId)
        {
            if (UserId != null && CommentId != null)
            {
                var Vote = await _VoteService.GetByUserAndCommentIdAsync(UserId, CommentId);

                if (Vote == null)
                    return Ok(new {id=-1, voteType=-2});

                return Ok(Vote);
            }

            var Votes = await _VoteService.GetAllAsync();

            if (Votes == null)
                return StatusCode(500, "A server error occurred when receiving all voting information.");

            return Ok(Votes);
        }

        // api/votes/{Id} 
        [HttpGet("{Id}")]
        public async Task<IActionResult> GetVoteById(long Id)
        {
            var Vote = await _VoteService.GetByIdAsync(Id);

            if (Vote == null) return NotFound();

            return Ok(Vote);
        }

        // api/votes 
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateVote([FromBody] VoteCreateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid USER TOKEN INFORMATION.");

            var ResponseDto = await _VoteService.CreateAsync(Dto, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while creating votes.");

            if (ResponseDto.IsCreated == true)
                return Ok(Dto);

            return ResponseDto.Issue switch
            {
                CreateIssue.SameContent => Conflict("You cannot vote for the same comment."),
                _ => BadRequest("Creating votes could not be carried out.")
            };
        }

        // api/votes/{Id} -> 
        [Authorize]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateVote(long Id, VoteUpdateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid USER TOKEN INFORMATION.");

            var ResponseDto = await _VoteService.UpdateAsync(Id, UserId, Dto);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while updating voting information.");

            if (ResponseDto.IsUpdated) return Ok(Dto);

            return ResponseDto.Issue switch
            {
                UpdateIssue.NotFound => NotFound($"The vote with ID {Id} was not found.."),
                UpdateIssue.NotOwner => Unauthorized("You cannot update a vote that does not belong to you."),
                _ => BadRequest("Voting update could not be performed.")
            };
        }

        // api/votes/{Id} -> 
        [Authorize]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteVote(long Id)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid USER TOKEN INFORMATION.");

            var ResponseDto = await _VoteService.DeleteAsync(Id, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while deleting the vote.");

            if (ResponseDto.IsDeleted) return NoContent();

            return ResponseDto.Issue switch
            {
                DeleteIssue.NotFound => NotFound($"The vote with ID {Id} was not found."),
                DeleteIssue.NotOwner => Unauthorized("You cannot delete a vote that does not belong to you."),
                _ => BadRequest("Voting could not be performed.")
            };
        }
    }
}

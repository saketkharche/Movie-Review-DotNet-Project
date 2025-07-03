using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Moviemo.Dtos;
using Moviemo.Dtos.Movie;
using Moviemo.Services.Interfaces;

namespace Moviemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly IMovieService _MovieService;

        public MoviesController(IMovieService MovieService)
        {
            
            _MovieService = MovieService;
        }

        // api/movies 
        [HttpGet]
        public async Task<IActionResult> GetAllMovies([FromQuery] int? PageIndex, [FromQuery] int? PageSize)
        {
            if (PageIndex != null && PageSize != null)
            {
                var Response = await _MovieService.GetByPageSizeAsync(PageIndex ?? -1, PageSize ?? -1);

                if (Response == null)
                {
                    return StatusCode(500, "A server error occurred during the page information.");
                }

                return Ok(Response);
            }

            var Movies = await _MovieService.GetAllAsync();

            if (Movies == null)
                return StatusCode(500, "A server error occurred while receiving all movie information.");

            return Ok(Movies);
        }

        // api/movies/{Id} 
        [HttpGet("{Id}")]
        public async Task<IActionResult> GetMovieById(long Id)
        {
            var Movie = await _MovieService.GetByIdAsync(Id);

            if (Movie == null) return NotFound();

            return Ok(Movie);
        }

        // api/movies 
        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> CreateMovie(MovieCreateDto Dto)
        {
            var Movie = await _MovieService.CreateAsync(Dto);

            if (Movie == null)
                return StatusCode(500, "A server error occurred while creating a film.");

            return Ok(Movie);
        }

        // api/movies/{Id} 
        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateMovie(long Id, MovieUpdateDto Dto)
        {
            var ResponseDto = await _MovieService.UpdateAsync(Id, Dto);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred while updating the comment.");

            if (ResponseDto.IsUpdated)
                return Ok(Dto);

            return ResponseDto.Issue switch
            {
                UpdateIssue.NotFound => NotFound($"The movie with ID {Id} was not found."),
                _ => BadRequest("The film update could not be performed.")
            };
        }

        // api/movies/{Id} 
        [Authorize(Roles = "Admin,Manager")]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteMovie(long Id)
        {
            var ResponseDto = await _MovieService.DeleteAsync(Id);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred when the movie was deleted");

            if (ResponseDto.IsDeleted) return NoContent();

            return ResponseDto.Issue switch
            {
                DeleteIssue.NotFound => NotFound($"The movie with ID {Id} was not found."),
                _ => BadRequest("Film deletion could not be performed.")
            };
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchMovie([FromQuery] string Query)
        {
            var Results = await _MovieService.SearchAsync(Query);

            if (Results == null)
            {
                return StatusCode(500, "A server error occurred during the search.");
            }

            return Ok(Results);
        }
    }
}

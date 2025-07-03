using Microsoft.AspNetCore.Mvc;
using Moviemo.Data;
using Moviemo.Models;
using System.Threading.Tasks;
using System.Linq;

namespace Moviemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackApiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FeedbackApiController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] Feedback feedback)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Feedback submitted successfully." });
        }

        // Optional: View all feedbacks (admin)
        [HttpGet]
        public IActionResult GetAll()
        {
            var feedbacks = _context.Feedbacks
                .OrderByDescending(f => f.SubmittedAt)
                .ToList();

            return Ok(feedbacks);
        }
    }
}
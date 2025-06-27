using Microsoft.EntityFrameworkCore;
using Moviemo.Data;
using Moviemo.Dtos;
using Moviemo.Dtos.Review;
using Moviemo.Models;
using Moviemo.Services.Interfaces;

namespace Moviemo.Services
{
    public class ReviewService : IReviewService
    {
        private readonly ILogger<ReviewService> _Logger;

        private readonly AppDbContext _Context;

        public ReviewService(AppDbContext Context, ILogger<ReviewService> Logger)
        {
            _Logger = Logger;
            _Context = Context;
        }
        public async Task<List<ReviewGetDto>?> GetAllAsync()
        {
            _Logger.LogInformation("All review information is obtained...");

            try
            {
                return await _Context.Reviews
                .Include(R => R.User)
                .Include(R => R.Movie)
                .Select(R => new ReviewGetDto
                {
                    Id = R.Id,
                    Body = R.Body,
                    UserId = R.User.Id,
                    MovieId = R.Movie.Id,
                    UserScore = R.UserScore,
                    CreatedAt = R.CreatedAt,
                    UpdatedAt = R.UpdatedAt,
                })
                .ToListAsync();
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred when receiving all review information."); ;
                return null;
            }
        }

        public async Task<ReviewGetDto?> GetByIdAsync(long Id)
        {
            _Logger.LogInformation("The review information with ID {Id} is being retrieved.", Id);
            try
            {
                return await _Context.Reviews
                .Include(R => R.User)
                .Include(R => R.Movie)
                .Select(R => new ReviewGetDto
                {
                    Id = R.Id,
                    Body = R.Body,
                    UserId = R.User.Id,
                    MovieId = R.Movie.Id,
                    UserScore = R.UserScore,
                    CreatedAt = R.CreatedAt,
                    UpdatedAt = R.UpdatedAt
                }).FirstOrDefaultAsync(R => R.Id == Id);
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred while retrieving the review information."); return null;
            }
        }

        public async Task<List<ReviewGetDto>?> GetByMovieIdAsync(long? MovieId)
        {
            _Logger.LogInformation("All reviews belonging to the movie are being retrieved...");
            try
            {
                return await _Context.Reviews.Where(R => R.MovieId == MovieId).Select(R => new ReviewGetDto
                {
                    Id = R.Id,
                    Body = R.Body,
                    UserId = R.User.Id,
                    MovieId = R.Movie.Id,
                    UserScore = R.UserScore,
                    CreatedAt = R.CreatedAt,
                    UpdatedAt = R.UpdatedAt
                }).ToListAsync();
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "A problem occurred while retrieving the reviews belonging to the movie."); return null;
            }
        }

        public async Task<ReviewCreateDto?> CreateAsync(ReviewCreateDto Dto, long UserId)
        {
            _Logger.LogInformation("A new review is being created: {@ReviewCreateDto}", Dto);
            try
            {
                var Review = new Review
                {
                    Body = Dto.Body,
                    UserId = UserId,
                    MovieId = Dto.MovieId,
                    UserScore = Dto.UserScore
                };

                await _Context.Reviews.AddAsync(Review);
                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The review has been successfully created.");
                return Dto;
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred while creating the review.");
                return null;
            }

            
        }

        public async Task<UpdateResponseDto?> UpdateAsync(long Id, long UserId, ReviewUpdateDto Dto)
        {
            _Logger.LogInformation("Updating review with ID {Id}: {@ReviewUpdateDto}", Id, Dto);
            try
            {
                var Review = await _Context.Reviews.FindAsync(Id);

                if (Review == null)
                    return new UpdateResponseDto { Issue = UpdateIssue.NotFound };

                if (Review.UserId !=  UserId)
                    return new UpdateResponseDto { Issue = UpdateIssue.NotOwner };

                var DtoProperties = Dto.GetType().GetProperties();
                var ReviewType = Review.GetType();

                foreach (var Property in DtoProperties)
                {
                    var NewValue = Property.GetValue(Dto);
                    if (NewValue == null) continue;

                    var TargetProperty = ReviewType.GetProperty(Property.Name);
                    if (TargetProperty == null || !TargetProperty.CanWrite) continue;

                    TargetProperty.SetValue(Review, NewValue);
                }

                Review.UpdatedAt = DateTime.UtcNow;

                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The review with ID {Id} has been successfully updated.", Id);

                return new UpdateResponseDto { IsUpdated = true };
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred while updating the review.");
                return null;
            }
        }

        public async Task<DeleteResponseDto?> DeleteAsync(long Id, long UserId)
        {
            _Logger.LogInformation("Deleting review with ID {Id}...", Id);
            try
            {
                var Review = await _Context.Reviews.FindAsync(Id);

                if (Review == null)
                    return new DeleteResponseDto { Issue = DeleteIssue.NotFound };

                if (Review.UserId != UserId)
                    return new DeleteResponseDto { Issue = DeleteIssue.NotOwner };

                _Context.Reviews.Remove(Review);
                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The review with ID {Id} has been successfully deleted.", Id);
                return new DeleteResponseDto { IsDeleted = true };
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred while deleting the review"); return null;
            }
        }
    }
}
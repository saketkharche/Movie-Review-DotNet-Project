using Microsoft.EntityFrameworkCore;
using Moviemo.Data;
using Moviemo.Dtos;
using Moviemo.Dtos.Comment;
using Moviemo.Models;
using Moviemo.Services.Interfaces;

namespace Moviemo.Services
{
    public class CommentService : ICommentService
    {
        private readonly ILogger<CommentService> _Logger;

        private readonly AppDbContext _Context;

        public CommentService(AppDbContext Context, ILogger<CommentService> Logger)
        {
            _Logger = Logger;
            _Context = Context;
        }

        public async Task<List<CommentGetDto>?> GetAllAsync()
        {
            _Logger.LogInformation("All comment information is obtained ...");

            try
            {
                return await _Context.Comments
                    .Include(C => C.User)
                    .Include(C => C.Movie)
                    .Include(C => C.Votes)
                    .Select(C => new CommentGetDto
                    {
                        Id = C.Id,
                        Body = C.Body,
                        UserId = C.User.Id,
                        MovieId = C.Movie.Id,
                        CreatedAt = C.CreatedAt,
                        UpdatedAt = C.UpdatedAt,
                        DownvoteCounter = C.Votes.Count(V => V.VoteType == VoteType.Downvote),
                        UpvoteCounter = C.Votes.Count(V => V.VoteType == VoteType.Upvote)
                    })
                    .ToListAsync();
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred while receiving all comments information.");
                return null;
            }
        }

        public async Task<CommentGetDto?> GetByIdAsync(long Id)
        {
            _Logger.LogInformation("The comment with ID {Id} is being retrieved....", Id);

            try
            {
                return await _Context.Comments
                    .Include(C => C.User)
                    .Include(C => C.Movie)
                    .Select(C => new CommentGetDto
                    {
                        Id = C.Id,
                        Body = C.Body,
                        UserId = C.User.Id,
                        MovieId = C.Movie.Id,
                        CreatedAt = C.CreatedAt,
                        UpdatedAt = C.UpdatedAt,
                        DownvoteCounter = C.Votes.Count(V => V.VoteType == VoteType.Downvote),
                        UpvoteCounter = C.Votes.Count(V => V.VoteType == VoteType.Upvote)
                    })
                    .FirstOrDefaultAsync(C => C.Id == Id);
            } catch (Exception Ex) 
            {
                _Logger.LogError(Ex, "An error occurred while retrieving the comment with ID {Id}.", Id);
                return null;
            }
        }

        public async Task<List<CommentGetDto>?> GetByMovieIdAsync(long? MovieId)
        {
            _Logger.LogInformation("All comments on the film are obtained...");

            try
            {
                return await _Context.Comments.Where(C => C.MovieId == MovieId).Select(C => new CommentGetDto
                {
                    Id = C.Id,
                    Body = C.Body,
                    UserId = C.User.Id,
                    MovieId = C.Movie.Id,
                    CreatedAt = C.CreatedAt,
                    UpdatedAt = C.UpdatedAt,
                    DownvoteCounter = C.Votes.Count(V => V.VoteType == VoteType.Downvote),
                    UpvoteCounter = C.Votes.Count(V => V.VoteType == VoteType.Upvote)
                }).ToListAsync();
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "A problem occurred while getting all the commentary information about the film.");
                return null;
            }
        }

        public async Task<CommentCreateDto?> CreateAsync(CommentCreateDto Dto, long UserId)
        {
            _Logger.LogInformation("New Comment is being created: {@CommentCreateDto}", Dto);

            try
            {
                var Comment = new Comment
                {
                    Body = Dto.Body,
                    UserId = UserId,
                    MovieId = Dto.MovieId
                };

                await _Context.Comments.AddAsync(Comment);
                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The comment was created successfully.");

                return Dto;
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred when creating a comment.");
                return null; 
            }
        }

        public async Task<UpdateResponseDto?> UpdateAsync(long Id, long UserId, CommentUpdateDto Dto)
        {
            _Logger.LogInformation("Updating comment with ID {Id}: {@CommentUpdateDto}", Id, Dto);

            try 
            { 
                var Comment = await _Context.Comments.FindAsync(Id);

                if (Comment == null)
                    return new UpdateResponseDto { Issue = UpdateIssue.NotFound };

                if (Comment.UserId != UserId)
                    return new UpdateResponseDto { Issue = UpdateIssue.NotOwner };

                    var DtoProperties = Dto.GetType().GetProperties();
                var CommentType = Comment.GetType();

                // CommentUpdateDto'
                foreach (var Property in DtoProperties)
                {
                    var NewValue = Property.GetValue(Dto);
                    if (NewValue == null) continue;

                    var TargetProperty = CommentType.GetProperty(Property.Name);
                    if (TargetProperty == null || !TargetProperty.CanWrite) continue;

                    TargetProperty.SetValue(Comment, NewValue);
                }

                Comment.UpdatedAt = DateTime.UtcNow;

                await _Context.SaveChangesAsync();

                _Logger.LogInformation("The comment with ID {Id} has been successfully updated.", Id);

                return new UpdateResponseDto { IsUpdated = true };
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred while updating the comment.");
                return null;
            }
        }

        public async Task<DeleteResponseDto?> DeleteAsync(long Id, long UserId)
        {
            _Logger.LogInformation("Deleting comment with ID {Id}...", Id);

            try
            {
                var Comment = await _Context.Comments.FindAsync(Id);

                if (Comment == null)
                    return new DeleteResponseDto { Issue = DeleteIssue.NotFound };

                if (Comment.UserId != UserId)
                    return new DeleteResponseDto { Issue = DeleteIssue.NotOwner  };

                _Context.Comments.Remove(Comment);
                await _Context.SaveChangesAsync();


                _Logger.LogInformation("The comment with ID {Id} has been successfully deleted.", Id);

                return new DeleteResponseDto { IsDeleted = true };
            }
            catch (Exception Ex)
            {
                _Logger.LogError(Ex, "An error occurred when deleting the comment.");
                return null;
            }
        }
    }
}
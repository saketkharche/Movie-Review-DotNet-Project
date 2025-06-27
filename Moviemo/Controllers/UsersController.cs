using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Moviemo.Dtos;
using Moviemo.Dtos.Token;
using Moviemo.Dtos.User;
using Moviemo.Services.Interfaces;

namespace Moviemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _UserService;

        public UsersController(IUserService UserService)
        {
            // Yapıcı metot içinde bağımlılık enjeksiyonu
            _UserService = UserService;
        }

        // api/users -> Tüm kullanıcı bilgilerini al
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] string? Username)
        {
            if (Username != null)
            {
                var User = await _UserService.GetByUsernameAsync(Username);

                if (User == null)
                {
                    return StatusCode(500, "A server error occurred during user information.");
                }

                return Ok(User);
            }

            var Users = await _UserService.GetAllAsync();

            if (Users == null)
                return StatusCode(500, "A server error occurred when receiving all user information.");

            return Ok(Users);
        }

        // api/users/{Id} -> Rotada belirtilen ID'ye sahip kullanıcı bilgilerini al
        [HttpGet("{Id}")]
        public async Task<IActionResult> GetUserById(long Id)
        {
            var User = await _UserService.GetByIdAsync(Id);

            if (User == null) return NotFound();

            return Ok(User);
        }

        // api/users -> Kullanıcı oluştur
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto Dto)
        {
            var ResponseDto = await _UserService.CreateAsync(Dto);

            if (ResponseDto == null) 
                return StatusCode(500, "A server error occurred when creating a user.");

            if (ResponseDto.IsCreated)
                return Ok(ResponseDto);

            return ResponseDto.Issue switch
            {
                CreateIssue.SameContent => BadRequest("Username in use."),
                _ => BadRequest("The user could not be performed.")
            };
        }

        // api/users/{Id} -> Rotada belirtilen ID'ye sahip kullanıcıyı güncelle
        [Authorize]
        [HttpPut("{Id}")]
        public async Task<IActionResult> UpdateUser(long Id, [FromBody] UserUpdateDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid USER TOKEN INFORMATION.");

            var ResponseDto = await _UserService.UpdateAsync(Id, UserId, Dto);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred when the user was updated.");

            if (ResponseDto.IsUpdated)
                return Ok(Dto);

            return ResponseDto.Issue switch
            { 
                UpdateIssue.NotFound => NotFound($"The user with ID {Id} was not found.."),
                UpdateIssue.SameContent => BadRequest("Username in use."),
                UpdateIssue.NotOwner => Unauthorized("You cannot update a user profile that does not belong to you."),
                _ => BadRequest("The user could not be updated.")
            };
        }

        // api/users/{Id} -> Rotada belirtilen ID'ye sahip kullanıcıyı sil
        [Authorize]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteUser(long Id)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid user token information..");

            var ResponseDto = await _UserService.DeleteAsync(Id, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred when the user was deleted.");

            if (ResponseDto.IsDeleted) return NoContent();

            return ResponseDto.Issue switch
            { 
                DeleteIssue.NotFound => NotFound($"The user with ID {Id} was not found.."),
                DeleteIssue.NotOwner => Unauthorized("You cannot delete a user profile that does not belong to you."),
                _ => BadRequest("User deletion could not be performed. ")
            };
        }

        // api/users/login -> Kullanıcı hesabına giriş yap
        [HttpPost("login")]
        public async Task<IActionResult> LoginUser([FromBody] UserLoginDto Dto)
        {
            var ResponseDto = await _UserService.LoginAsync(Dto);

            if (ResponseDto == null) 
                return StatusCode(500, "A server error occurred during the user login.");

            if (ResponseDto.Issue == LoginIssue.None)
                return Ok(ResponseDto);

            return ResponseDto.Issue switch
            {
                LoginIssue.NotFound => NotFound("An account with the username entered was not found."),
                LoginIssue.IncorrectPassword => BadRequest("Password wrong."),
                _ => BadRequest("User login could not be realized.")
            };
        }

        // api/users/refresh-token -> Kullanıcının access ve refresh tokenlerini yenile
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshTokens([FromBody] RefreshTokenRequestDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid USER TOKEN INFORMATION.");

            var Result = await _UserService.RefreshTokensAsync(UserId, Dto);

            if (Result == null)
                return StatusCode(500, "A server error occurred while the token was renewed.");

            if (Result.AccessToken == null || Result.RefreshToken == null) 
                return Unauthorized("Invalid refresh token");

            return Ok(Result);
        }

        [Authorize]
        [HttpPut("{Id}/change-password")]
        public async Task<IActionResult> ChangePassword(long Id, [FromBody] ChangePasswordDto Dto)
        {
            if (!long.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var UserId))
                return Unauthorized("Invalid USER TOKEN INFORMATION.");

            var ResponseDto = await _UserService.ChangePasswordAsync(Dto, Id, UserId);

            if (ResponseDto == null)
                return StatusCode(500, "A server error occurred when changing the user password.");

            return ResponseDto.Issue switch
            {
                PasswordChangeIssue.None => Ok(ResponseDto),
                PasswordChangeIssue.IncorrectOldPassword => BadRequest("Old password entered incorrectly."),
                _ => BadRequest("No password replacement process has been performed.")
            };
        }
    }
}

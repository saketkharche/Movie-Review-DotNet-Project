using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Moviemo.Data;
using Moviemo.Dtos.Token;
using Moviemo.Models;
using Moviemo.Services.Interfaces;

namespace Moviemo.Services
{
    public class TokenService(IConfiguration Configuration, AppDbContext Context, ILogger<TokenService> Logger) : ITokenService
    {
        public async Task<TokenResponseDto> CreateTokenResponseAsync(User User)
        {
            Logger.LogInformation("Creating token response...");

            try
            {
                var Response = new TokenResponseDto
                {
                    AccessToken = CreateToken(User),
                    RefreshToken = await GenerateAndSaveRefreshTokenAsync(User)
                };

                return Response;
            }
            catch (Exception Ex)
            {
                Logger.LogError(Ex, "An error occurred while creating the token response.");
                return new TokenResponseDto { };
            }
        }

        public async Task<TokenResponseDto?> RefreshTokensAsync(long UserId, string RefreshToken)
        {
            Logger.LogInformation("Refreshing tokens...");

            try
            {
                var User = await ValidateRefreshTokenAsync(UserId, RefreshToken);

                if (User is null) return null;

                Logger.LogInformation("Tokens successfully refreshed.");

                return await CreateTokenResponseAsync(User);
            }
            catch (Exception Ex)
            {
                Logger.LogError(Ex, "An error occurred while refreshing tokens.");
                return null;
            }
        }

        public async Task<User?> ValidateRefreshTokenAsync(long UserId, string RefreshToken)
        {
            Logger.LogInformation("Validating refresh token...");

            try
            {
                var User = await Context.Users.FindAsync(UserId);

                if (User == null ||
                    User.RefreshToken != RefreshToken ||
                    User.RefreshTokenExpiryTime <= DateTime.UtcNow)
                    return null;

                Logger.LogInformation("Refresh token successfully validated.");

                return User;
            }
            catch (Exception Ex)
            {
                Logger.LogError(Ex, "An error occurred while validating the refresh token.");
                return null;
            }
        }

        public string GenerateRefreshToken()
        {
            Logger.LogInformation("Generating new refresh token...");

            try
            {
                var RandomNumber = new byte[32];
                using var Rng = RandomNumberGenerator.Create();
                Rng.GetBytes(RandomNumber);
                return Convert.ToBase64String(RandomNumber);
            }
            catch (Exception Ex)
            {
                Logger.LogError(Ex, "An error occurred while generating the refresh token.");
                throw new ApplicationException("Failed to generate refresh token. Please try again later.");
            }
        }

        public async Task<string> GenerateAndSaveRefreshTokenAsync(User User)
        {
            var RefreshToken = GenerateRefreshToken();
            User.RefreshToken = RefreshToken;
            User.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await Context.SaveChangesAsync();
            return RefreshToken;
        }

        public string CreateToken(User User)
        {
            Logger.LogInformation("Creating new JWT token...");

            try
            {
                var Claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, User.Username),
                    new Claim(ClaimTypes.NameIdentifier, User.Id.ToString()),
                    new Claim(ClaimTypes.Role, User.UserRole.ToString())
                };

                var Key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(Configuration.GetValue<string>("AppSettings:Token")!));

                var Creds = new SigningCredentials(Key, SecurityAlgorithms.HmacSha512);

                var TokenDescriptor = new JwtSecurityToken(
                        issuer: Configuration.GetValue<string>("AppSettings:Issuer"),
                        audience: Configuration.GetValue<string>("AppSettings:Audience"),
                        claims: Claims,
                        expires: DateTime.UtcNow.AddDays(1),
                        signingCredentials: Creds
                );

                return new JwtSecurityTokenHandler().WriteToken(TokenDescriptor);
            }
            catch (Exception Ex)
            {
                Logger.LogError(Ex, "An error occurred while creating the JWT token.");
                throw new ApplicationException("JWT token could not be created. Please try again later.");
            }
        }
    }
}
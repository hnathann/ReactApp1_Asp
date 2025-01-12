using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ReactApp1_Asp.Server.Data;
using ReactApp1_Asp.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ReactApp1_Asp.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly MyDbContext dbContext;
        private readonly IConfiguration configuration;

        public UsersController(MyDbContext dbContext, IConfiguration configuration)
        {
            this.dbContext = dbContext;
            this.configuration = configuration; 
        }

        // Endpoint Register
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDTO model)
        {
            // verify if user alrdy exist
            if (dbContext.Users.Any(u => u.Email == model.Email))
            {
                return BadRequest(new { message = "User already exists" });
            }

            // new user creattion
            var user = new User
            {
                UserName = model.UserName,
                FirstName = model.FirstName,
                LastName = model.LastName,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                Password = model.Password, 
                Role = "user" // default role userr change directly in database to librarian
            };

            // add it to the database
            dbContext.Users.Add(user);
            dbContext.SaveChanges();

            return Ok(new { message = "User registered successfully" });
        }

        // Endpoint Login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDTO model)
        {
            var user = dbContext.Users.FirstOrDefault(u => u.Email == model.Email && u.Password == model.Password);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserName", user.UserName)
            };

            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: configuration["Jwt:Issuer"],
                audience: configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { Token = tokenString, Role = user.Role });
        }
    }
}

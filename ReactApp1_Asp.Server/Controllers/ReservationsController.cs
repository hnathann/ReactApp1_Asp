using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1_Asp.Server.Data;
using ReactApp1_Asp.Server.Models;
using ReactApp1_Asp.Server.DTOs;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace ReactApp1_Asp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private readonly MyDbContext _context;

        public ReservationsController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/Reservations
        [HttpGet]
        public async Task<IActionResult> GetReservations()
        {
            var reservations = await _context.Reservations
                .Include(r => r.Book) 
                .Include(r => r.User) 
                .Select(r => new
                {
                    r.Id,
                    UserId = r.UserId,
                    UserName = r.User.UserName,
                    BookId = r.BookId,
                    BookTitle = r.Book.Title,
                    r.ReservationDate,
                    r.ExpirationDate,
                    IsAvailable = r.Book.IsAvailable 
                })
                .ToListAsync();

            return Ok(reservations);
        }


        // GET: api/Reservations/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservation(int id)
        {
            var reservation = await _context.Reservations
                .Include(r => r.Book)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null) return NotFound();
            return Ok(reservation);
        }

        // POST: api/Reservations
      
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationDto reservationDto)
        {
            // i get the id of jwt here 
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized("Invalid token or user not authenticated.");
            }

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid user ID in token.");
            }

            // veryfing if the books is dispoonible
            var book = await _context.Books.FindAsync(reservationDto.BookId);
            if (book == null || !book.IsAvailable)
            {
                return BadRequest("Book is not available.");
            }

            // create new reservation
            var reservation = new Reservation
            {
                UserId = userId, 
                BookId = reservationDto.BookId,
                ReservationDate = DateTime.UtcNow,
                ExpirationDate = DateTime.UtcNow.AddDays(1)
            };

            book.IsAvailable = false; // Mark book as resrvedd
            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, reservation);
        }


        // DELETE: api/Reservations/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);
            if (reservation == null) return NotFound();

            // mark the books as avlable
            var book = await _context.Books.FindAsync(reservation.BookId);
            if (book != null) book.IsAvailable = true;

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{id}/accept")]
        public async Task<IActionResult> AcceptReservation(int id)
        {
            var reservation = await _context.Reservations.Include(r => r.Book).FirstOrDefaultAsync(r => r.Id == id);
            if (reservation == null)
                return NotFound("Reservation not found.");

            if (!reservation.Book.IsAvailable)
                return BadRequest("Book is already loaned.");

            // Convert reservation to loan
            var loan = new Loan
            {
                UserId = reservation.UserId,
                BookId = reservation.BookId,
                LoanDate = DateTime.UtcNow,
                ReturnDate = null // Not yet returned
            };

            _context.Loans.Add(loan);
            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return Ok(loan);
        }

    }

}
    
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactApp1_Asp.Server.Data;
using ReactApp1_Asp.Server.Models;

namespace ReactApp1_Asp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoansController : ControllerBase
    {
        private readonly MyDbContext _context;

        public LoansController(MyDbContext context)
        {
            _context = context;
        }

        // GET: api/Loans
        [HttpGet]
        public async Task<IActionResult> GetLoans()
        {
            var loans = await _context.Loans
                .Include(l => l.Book)
                .Include(l => l.User)
                .ToListAsync();
            return Ok(loans);
        }

        // GET: api/Loans/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLoan(int id)
        {
            var loan = await _context.Loans
                .Include(l => l.Book)
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (loan == null) return NotFound("Loan not found.");
            return Ok(loan);
        }

        // POST: api/Loans
        [HttpPost]
        
        public async Task<IActionResult> CreateLoan([FromBody] int reservationId)
        {
            Console.WriteLine($"Received reservationId: {reservationId}");

            var reservation = await _context.Reservations
                .Include(r => r.Book)
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                return BadRequest("Reservation not found.");
            }

            var loan = new Loan
            {
                UserId = reservation.UserId,
                BookId = reservation.BookId,
                LoanDate = DateTime.UtcNow
            };

            _context.Loans.Add(loan);

            reservation.Book.IsAvailable = false;
            _context.Reservations.Remove(reservation);

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetLoan), new { id = loan.Id }, loan);
        }


        // PUT: api/Loans/{id}/Return
        [HttpPut("{id}/Return")]
        public async Task<IActionResult> ReturnLoan(int id)
        {
            var loan = await _context.Loans.Include(l => l.Book).FirstOrDefaultAsync(l => l.Id == id);
            if (loan == null) return NotFound("Loan not found.");

            
            loan.ReturnDate = DateTime.UtcNow;
            if (loan.Book != null) loan.Book.IsAvailable = true;

            await _context.SaveChangesAsync();
            return Ok("Book returned successfully.");
        }
    }
}

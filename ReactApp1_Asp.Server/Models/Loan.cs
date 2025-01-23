using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1_Asp.Server.Models
{
    public class Loan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; } // Link to the User who borrowed the book
        public User User { get; set; }

        [Required]
        [ForeignKey("Book")]
        public int BookId { get; set; } // Link to the borrowed book
        public Book Book { get; set; }

        [Required]
        public DateTime LoanDate { get; set; } // Date the loan was made

        public DateTime? ReturnDate { get; set; } // Date the book was returned (nullable)
    }
}

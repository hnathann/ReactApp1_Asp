using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactApp1_Asp.Server.Models
{
    public class Reservation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("User")]
        public int UserId { get; set; } 
        public User User { get; set; }

        [Required]
        [ForeignKey("Book")]
        public int BookId { get; set; } 
        public Book Book { get; set; }

        [Required]
        public DateTime ReservationDate { get; set; } 

        [Required]
        public DateTime ExpirationDate { get; set; }
    }
}

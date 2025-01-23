using System.ComponentModel.DataAnnotations;

namespace ReactApp1_Asp.Server.Models
{
    public class Book
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        [Required]
        public string Author { get; set; }

        [Required]
        public string Publisher { get; set; }

        public DateTime PublicationDate { get; set; }

        [Required]
        public decimal Price { get; set; }

        public List<string> HistoryOfLeases { get; set; } = new List<string>();

        public bool IsAvailable { get; set; } = true;
        public bool IsReserved { get; set; } = false; 
    }
}

using Microsoft.AspNetCore.Mvc;

namespace ReactApp1_Asp.Server.DTOs
{
    public class ReservationResponseDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string BookTitle { get; set; }
        public DateTime ReservationDate { get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}


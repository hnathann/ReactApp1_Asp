using Microsoft.EntityFrameworkCore;
using ReactApp1_Asp.Server.Models;

namespace ReactApp1_Asp.Server.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } 
        public DbSet<Book> Books { get; set; } 
        public DbSet<Reservation> Reservations { get; set; } 
        public DbSet<Loan> Loans { get; set; } 
    }
}

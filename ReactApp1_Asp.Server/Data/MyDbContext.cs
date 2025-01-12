using Microsoft.EntityFrameworkCore;
using ReactApp1_Asp.Server.Models;

namespace ReactApp1_Asp.Server.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

       
        public DbSet<User> Users { get; set; } //we add the user data TABLE HERE 
        public DbSet<Book> Books { get; set; }
    }
}

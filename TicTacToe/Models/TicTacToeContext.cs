using Microsoft.EntityFrameworkCore;

namespace TicTacToe.Models
{
    public class TicTacToeContext : DbContext
    {
        public TicTacToeContext(DbContextOptions<TicTacToeContext> options) : base(options) { }

        public DbSet<Game> Games { get; set; }
    }
}

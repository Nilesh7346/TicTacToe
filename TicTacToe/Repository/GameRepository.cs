using System.Transactions;
using TicTacToe.Models;

namespace TicTacToe.Repository
{
    public class GameRepository
    {
        private readonly TicTacToeContext _context;

        public GameRepository(TicTacToeContext context)
        {
            _context = context;
        }

        public Game GetGameWithLock(int gameId)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            }))
            {
                var game = _context.Games.SingleOrDefault(g => g.Id == gameId);
                transactionScope.Complete();
                return game;
            }
        }

        public void UpdateGame(Game game)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            }))
            {
                _context.Games.Update(game);
                _context.SaveChanges();
                transactionScope.Complete();
            }
        }
    }
}

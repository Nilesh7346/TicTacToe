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

        public Game? GetGameWithLock(int gameId)
        {
            try
            {
                using (var transactionScope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions
                {
                    IsolationLevel = IsolationLevel.ReadCommitted
                }))
                {
                    var game = _context.Game.SingleOrDefault(g => g.Id == gameId);
                    transactionScope.Complete();
                    return game;
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        public void UpdateGame(Game game)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            }))
            {
                _context.Game.Update(game);
                _context.SaveChanges();
                transactionScope.Complete();
            }
        }

        public void AddGame(Game game)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeOption.Required, new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            }))
            {
                _context.Game.Add(game);
                _context.SaveChanges();
                transactionScope.Complete();
            }
        }
    }
}

using Microsoft.AspNetCore.SignalR;
using TicTacToe.Repository;

namespace TicTacToe.SingnalRHub
{
    public class GameHub : Hub
    {
        private readonly GameRepository _repository;

        public GameHub(GameRepository repository)
        {
            _repository = repository;
        }

        public async Task UpdateGame(int gameId, string boardState)
        {
            var game = _repository.GetGameWithLock(gameId);
            if (game != null)
            {
                game.BoardState = boardState;
                game.CurrentTurn = game.CurrentTurn == "X" ? "O" : "X";
                _repository.UpdateGame(game);

                await Clients.Others.SendAsync("ReceiveUpdate", gameId, boardState);
            }
        }
    }
}

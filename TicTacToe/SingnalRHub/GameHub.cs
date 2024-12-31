using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using TicTacToe.Models;
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

        public async Task UpdateGame(int gameId, string boardState, string currentTurn)
        {
            try
            {
                var game = _repository.GetGameWithLock(gameId);
                if (game != null)
                {

                    var winner = CheckWinner(boardState);
                    if (string.IsNullOrEmpty(winner))
                    {
                        game.BoardState = boardState;
                        game.CurrentTurn = currentTurn;
                        _repository.UpdateGame(game);

                        await Clients.All.SendAsync("ReceiveUpdate", gameId, boardState, currentTurn);
                    }
                    else if (!string.IsNullOrEmpty(winner))
                    {
                        game.BoardState = boardState;
                        game.CurrentTurn = currentTurn;
                        _repository.UpdateGame(game);

                        await Clients.All.SendAsync("GameOver", gameId, winner);
                    }
                    else if (IsDraw(boardState))
                    {
                        game.Winner = "Draw";
                        _repository.UpdateGame(game);

                        // Notify all clients about the draw
                        await Clients.All.SendAsync("GameOver", gameId, "Draw");
                    }
                }

                else
                {
                    game = new Game
                    {
                        BoardState = boardState ?? "[[\"\", \"\", \"\"], [\"\", \"\", \"\"], [\"\", \"\", \"\"]]", // Initial empty board state
                        CurrentTurn = "X",
                        Winner = "Pending"
                    };
                    _repository.AddGame(game);
                    await Clients.All.SendAsync("ReceiveUpdate", gameId, boardState);
                }
                }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task PlayerJoined(string playerSymbol)
        {
            // Notify all clients that a player has joined
            await Clients.All.SendAsync("PlayerJoined", playerSymbol);
        }


        private string CheckWinner(string boardState)
        {
            var board = JsonConvert.DeserializeObject<string[][]>(boardState);

            // Check rows and columns
            for (int i = 0; i < 3; i++)
            {
                if (!string.IsNullOrEmpty(board[i][0]) && board[i][0] == board[i][1] && board[i][1] == board[i][2])
                    return board[i][0];
                if (!string.IsNullOrEmpty(board[0][i]) && board[0][i] == board[1][i] && board[1][i] == board[2][i])
                    return board[0][i];
            }

            // Check diagonals
            if (!string.IsNullOrEmpty(board[0][0]) && board[0][0] == board[1][1] && board[1][1] == board[2][2])
                return board[0][0];
            if (!string.IsNullOrEmpty(board[0][2]) && board[0][2] == board[1][1] && board[1][1] == board[2][0])
                return board[0][2];

            return null;
        }

        private bool IsDraw(string boardState)
        {
            var board = JsonConvert.DeserializeObject<string[][]>(boardState);
            return board.All(row => row.All(cell => !string.IsNullOrEmpty(cell)));
        }
    }
}

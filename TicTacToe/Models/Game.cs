namespace TicTacToe.Models
{
    public class Game
    {
        public int Id { get; set; }
        public string PlayerOne { get; set; }
        public string PlayerTwo { get; set; }
        public string BoardState { get; set; } 
        public string CurrentTurn { get; set; }
        public string Winner { get; set; }
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from '../app/signal-r.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  board: string[][] = Array(3).fill(null).map(() => Array(3).fill(''));
  currentTurn: string = 'X';
  playerName: string = '';
  isGameStarted: boolean = false;
  gameId: number = 1;
  myTurn: boolean = false; // Flag to check if it's this player's turn
  assignedSymbol: string = ''; // Player's assigned symbol (X or O)
  isPlayerXJoined: boolean = false;
  isPlayerOJoined: boolean = false;

  constructor(private signalRService: SignalRService) { }

  async ngOnInit() {
    await this.signalRService.startConnection();
    this.signalRService.onReceiveUpdate((gameId, boardState, currentTurn) => {
      if (gameId === this.gameId) {
        this.board = JSON.parse(boardState);
        this.currentTurn = currentTurn;
        this.myTurn = (this.assignedSymbol === this.currentTurn); // Check if it's this player's turn
      }
    });

    this.signalRService.onPlayerJoined((playerSymbol) => {
      if (playerSymbol === 'X') {
        this.isPlayerXJoined = true;
      } else if (playerSymbol === 'O') {
        this.isPlayerOJoined = true;
      }
    });

    this.signalRService.onGameOver((gameId, winner) => {
      if (gameId === this.gameId) {
        if (winner === 'Draw') {
          alert('The game is a draw!');
        } else {
          alert(`Player ${winner} wins!`);
        }
        this.isGameStarted = false;
      }
    });
  }

  ngOnDestroy() {
    this.signalRService.stopConnection();
  }

  // Player joins the game
  joinGame(playerSymbol: string) {
    if (this.playerName.trim() === '') {
      alert('Please enter a valid name.');
      return;
    }
    this.assignedSymbol = playerSymbol;
    this.myTurn = playerSymbol === 'X'; // 'X' always starts first
    this.isGameStarted = true;

    // Notify the server that a player has joined
    this.signalRService.notifyPlayerJoined(playerSymbol);
  }

  // Send an update to the server
  sendUpdate() {
    this.signalRService.sendUpdate(this.gameId, JSON.stringify(this.board), this.currentTurn);
  }


  // Make a move if it's the player's turn
  makeMove(row: number, col: number) {
    if (!this.isGameStarted) {
      alert('Please join the game first.');
      return;
    }
    if (!this.myTurn) {
      alert('Wait for your turn!');
      return;
    }
    if (this.board[row][col] === '') {
      this.board[row][col] = this.currentTurn;
      this.currentTurn = this.currentTurn === 'X' ? 'O' : 'X';
      this.myTurn = false; // End this player's turn
      this.sendUpdate();
    }
  }
}

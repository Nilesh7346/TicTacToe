import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HubConnectionBuilder } from '@microsoft/signalr';
@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private baseUrl = "http://localhost:5234/";
  private readonly hubConnection: signalR.HubConnection;
  constructor() {
    // Initialize the connection here
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5234/gamehub')
      .build();
  }



  // Start connection and handle errors
  async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.log('SignalR connected');
    } catch (error) {
      console.error('SignalR connection error:', error);
    }
  }

  // Method to send data to the server
  sendUpdate(gameId: number, boardState: string, currentTurn: string) {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .invoke('UpdateGame', gameId, boardState, currentTurn)
        .catch((err) => console.error('Error sending update:', err));
    } else {
      console.warn('Cannot send update, not connected to SignalR hub');
    }
  }

  // Method to listen for incoming updates from the server
  onReceiveUpdate(callback: (gameId: number, boardState: string, currentTurn: string) => void) {
    this.hubConnection.on('ReceiveUpdate', (gameId, boardState, currentTurn) => {
      callback(gameId, boardState, currentTurn);
    });
  }


  // Cleanup and disconnect from the SignalR hub when no longer needed
  stopConnection() {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection
        .stop()
        .then(() => {
          console.log('SignalR connection stopped');
        })
        .catch((err) => {
          console.error('Error stopping connection:', err);
        });
    }
  }

  onPlayerJoined(callback: (playerSymbol: string) => void) {
    this.hubConnection.on('PlayerJoined', (playerSymbol) => {
      callback(playerSymbol);
    });
  }

  notifyPlayerJoined(playerSymbol: string) {
    this.hubConnection.invoke('PlayerJoined', playerSymbol).catch(err => console.error(err));
  }

  onGameOver(callback: (gameId: number, winner: string) => void) {
    this.hubConnection.on('GameOver', (gameId, winner) => {
      callback(gameId, winner);
    });
  }
}

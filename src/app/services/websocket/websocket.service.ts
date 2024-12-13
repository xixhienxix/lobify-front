import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket!: WebSocket;

  // Connect to WebSocket server
  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };
  }

  // Set the callback for handling messages
  setMessageHandler(callback: (data: string) => void): void {
    if (this.socket) {
      this.socket.onmessage = (event) => {
        console.log('Message received:', event.data);
        callback(event.data); // Invoke the provided callback function
      };
    }
  }

  // Send a message
  send(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket is not open. Unable to send message.');
    }
  }

  // Close the WebSocket connection
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}

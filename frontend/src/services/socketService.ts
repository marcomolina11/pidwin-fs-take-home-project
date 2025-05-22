import { io, Socket } from 'socket.io-client';
import { addGameResult } from '../actions/game';
import { AnyAction } from 'redux';

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private dispatch: ((action: AnyAction) => void) | null = null;

  // Initialize the socket connection
  initialize(dispatch?: (action: AnyAction) => void): void {
    if (this.connected) return;
    
    // Store the dispatch function if provided
    if (dispatch) {
      this.dispatch = dispatch;
    }

    this.socket = io('http://localhost:8000');
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    // Set up global listeners
    this.setupListeners();
  }

  // Set up event listeners that dispatch to Redux
  private setupListeners(): void {
    if (!this.socket) return;

    // Game result listener
    this.socket.on('gameResult', (gameResult) => {
      if (this.dispatch) {
        this.dispatch(addGameResult(gameResult));
      }
    });

    // Add more event listeners here as needed
  }

  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.connected;
  }

  // Get the socket instance (in case components need direct access)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
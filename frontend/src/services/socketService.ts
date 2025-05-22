import { io, Socket } from 'socket.io-client';
import { addGameResult } from '../actions/game';
import { UPDATE_USER } from '../constants/actionTypes';
import { AnyAction } from 'redux';
import { RootState } from '../types/store';

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private dispatch: ((action: AnyAction) => void) | null = null;
  private getState: (() => RootState) | null = null;

  // Initialize the socket connection (pass both dispatch and getState)
  initialize(
    dispatch?: (action: AnyAction) => void,
    getState?: () => RootState
  ): void {
    if (this.connected) return;

    if (dispatch) {
      this.dispatch = dispatch;
    }

    if (getState) {
      this.getState = getState;
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

    this.setupListeners();
  }

  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('gameResult', (gameResult) => {
      if (this.dispatch && this.getState) {
        // Dispatch game result
        this.dispatch(addGameResult(gameResult));

        // Get current user from state
        const state = this.getState();
        const currentUser = state.auth.user;

        // If user is logged in and affected by this game result
        if (
          currentUser &&
          gameResult.affectedUsers &&
          gameResult.affectedUsers[currentUser._id]
        ) {
          // Update user data in store
          this.dispatch({
            type: UPDATE_USER,
            payload: gameResult.affectedUsers[currentUser._id],
          });
        }
      }
    });
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

  // Get the socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;

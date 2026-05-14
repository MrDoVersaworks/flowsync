import { io, Socket } from 'socket.io-client';
import { SocketEvent } from '@/constants';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinWorkspace(workspaceId: string) {
    if (this.socket) {
      this.socket.emit(SocketEvent.JOIN_WORKSPACE, workspaceId);
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    const socket = this.connect();
    socket.on(event, callback);
  }

  off(event: string) {
    if (!this.socket) return;
    this.socket.off(event);
  }

  emit(event: string, data: unknown) {
    const socket = this.connect();
    socket.emit(event, data);
  }
}

export const socketService = new SocketService();

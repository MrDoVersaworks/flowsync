import { io, Socket } from 'socket.io-client';
import Pusher from 'pusher-js';
import { SocketEvent } from '@/constants';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

class SocketService {
  private socket: Socket | null = null;
  private pusher: Pusher | null = null;
  private currentChannelName: string | null = null;
  private eventHandlers: Map<string, (data: unknown) => void> = new Map();

  connect() {
    if (!this.socket && !PUSHER_KEY) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
      });
    }
    if (!this.pusher && PUSHER_KEY) {
      this.pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }
  }

  joinWorkspace(workspaceId: string, user: { id: string; name: string }) {
    this.currentChannelName = workspaceId;
    if (this.socket) {
      this.socket.emit(SocketEvent.JOIN_WORKSPACE, { workspaceId, user });
    }
    if (PUSHER_KEY && this.pusher) {
      const channel = this.pusher.subscribe(workspaceId);
      this.eventHandlers.forEach((handler, event) => {
        channel.unbind(event);
        channel.bind(event, handler);
      });
    }
  }

  on(event: string, callback: (data: unknown) => void) {
    this.eventHandlers.set(event, callback);
    this.connect();

    if (PUSHER_KEY && this.pusher && this.currentChannelName) {
      const channel = this.pusher.subscribe(this.currentChannelName);
      channel.unbind(event);
      channel.bind(event, callback);
    } else if (this.socket) {
      this.socket.off(event);
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    this.eventHandlers.delete(event);
    if (this.socket) {
      this.socket.off(event);
    }
    if (this.pusher && this.currentChannelName) {
      const channel = this.pusher.channel(this.currentChannelName);
      if (channel) {
        channel.unbind(event);
      }
    }
  }

  emit(event: string, data: unknown) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();

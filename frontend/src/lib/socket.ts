import { io, Socket } from 'socket.io-client';
import Pusher from 'pusher-js';
import { SocketEvent } from '@/constants';
import { useAuthStore } from '@/store/useAuthStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

class SocketService {
  private socket: Socket | null = null;
  private pusher: Pusher | null = null;
  private currentChannelName: string | null = null;
  private eventHandlers: Map<string, (data: unknown) => void> = new Map();

  connect() {
    if (!this.socket) {
      const token = useAuthStore.getState().accessToken;
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        auth: token ? { token } : undefined,
      });
    }
    if (!this.pusher && PUSHER_KEY) {
      this.pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        authEndpoint: `${API_URL}/realtime/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().accessToken || ''}`,
          },
        },
      });
    }
    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.pusher?.disconnect();
    this.pusher = null;
    this.currentChannelName = null;
  }

  joinWorkspace(workspaceId: string) {
    this.currentChannelName = workspaceId;
    this.connect();

    if (this.socket) {
      this.socket.emit(SocketEvent.JOIN_WORKSPACE, { workspaceId });
    }

    if (PUSHER_KEY && this.pusher) {
      const channel = this.pusher.subscribe(`private-workspace-${workspaceId}`);
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
      const channel = this.pusher.subscribe(`private-workspace-${this.currentChannelName}`);
      channel.unbind(event);
      channel.bind(event, callback);
    }
    if (this.socket) {
      this.socket.off(event);
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    this.eventHandlers.delete(event);
    this.socket?.off(event);
    if (this.pusher && this.currentChannelName) {
      this.pusher.channel(`private-workspace-${this.currentChannelName}`)?.unbind(event);
    }
  }

  emit(event: string, data: unknown) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();

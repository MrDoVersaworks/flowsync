import Pusher from 'pusher';
import { config } from '../config/index.js';
import { logger } from './logger.js';

let pusherInstance: Pusher | null = null;

if (config.pusherAppId && config.pusherKey && config.pusherSecret && config.pusherCluster) {
  pusherInstance = new Pusher({
    appId: config.pusherAppId,
    key: config.pusherKey,
    secret: config.pusherSecret,
    cluster: config.pusherCluster,
    useTLS: true,
  });
  logger.info('PUSHER', 'Pusher Channels initialized for private workspace events');
}

export function workspaceChannel(workspaceId: string): string {
  return `private-workspace-${workspaceId}`;
}

export function authorizeWorkspaceChannel(socketId: string, channelName: string, userId: string, workspaceId: string) {
  if (!pusherInstance) {
    throw new Error('Pusher is not configured');
  }
  if (channelName !== workspaceChannel(workspaceId)) {
    throw new Error('Invalid channel');
  }
  return pusherInstance.authorizeChannel(socketId, channelName, {
    user_id: userId,
  });
}

export function broadcastRealtime(workspaceId: string, event: string, data: unknown): void {
  if (pusherInstance) {
    pusherInstance.trigger(workspaceChannel(workspaceId), event, data).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Broadcast failed';
      logger.error('PUSHER', `Failed to trigger event '${event}': ${msg}`);
    });
  }
}

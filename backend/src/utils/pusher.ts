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
  logger.info('PUSHER', 'Pusher Channels initialized for serverless real-time events');
}

export function broadcastRealtime(channel: string, event: string, data: unknown): void {
  if (pusherInstance) {
    pusherInstance.trigger(channel, event, data).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Broadcast failed';
      logger.error('PUSHER', `Failed to trigger event '${event}' on channel '${channel}': ${msg}`);
    });
  }
}

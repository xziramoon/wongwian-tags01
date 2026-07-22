import * as Ably from 'ably';
import type { Config, QueueItem } from '../types';
import { ABLY_API_KEY, PRINT_TAGS_CHANNEL, PRINT_EVENT_NAME, PRINT_PAYLOAD_VERSION } from '../constants';

export interface PrintPayload {
  v: number;
  ts: number;
  config: Config;
  items: QueueItem[];
}

/* publishes the current queue+config to the remote TAG_PRINTER receiver over Ably
 * (wss on port 443 — unlike the old MQTT broker, this survives shop/office firewalls) */
class PrintBridge {
  private client: Ably.Realtime | null = null;

  private getClient(): Ably.Realtime {
    if (!this.client) this.client = new Ably.Realtime({ key: ABLY_API_KEY });
    return this.client;
  }

  private waitConnected(client: Ably.Realtime): Promise<void> {
    if (client.connection.state === 'connected') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const onConnected = () => {
        client.connection.off('failed', onFailed);
        resolve();
      };
      const onFailed = (change: Ably.ConnectionStateChange) => {
        client.connection.off('connected', onConnected);
        reject(new Error(change.reason?.message || 'Ably connection failed'));
      };
      client.connection.once('connected', onConnected);
      client.connection.once('failed', onFailed);
    });
  }

  async publish(config: Config, items: QueueItem[]): Promise<void> {
    const client = this.getClient();
    await this.waitConnected(client);
    const payload: PrintPayload = { v: PRINT_PAYLOAD_VERSION, ts: Date.now(), config, items };
    const channel = client.channels.get(PRINT_TAGS_CHANNEL);
    await channel.publish(PRINT_EVENT_NAME, payload);
  }
}

export const printBridge = new PrintBridge();

import * as Ably from 'ably';
import type { Config, QueueItem } from '../types';
import {
  ABLY_API_KEY,
  PRINT_BATCH_MAX_BYTES,
  PRINT_TAGS_CHANNEL,
  PRINT_EVENT_NAME,
  PRINT_PAYLOAD_VERSION,
} from '../constants';

export interface PrintPayload {
  v: number;
  ts: number;
  batchId: string;
  batchIndex: number;
  batchTotal: number;
  config: Config;
  items: QueueItem[];
}

export type PublishProgress = (sent: number, total: number) => void;

const jsonBytes = (value: unknown): number => new Blob([JSON.stringify(value)]).size;

/* splits items into chunks that each stay under PRINT_BATCH_MAX_BYTES once wrapped in
 * a PrintPayload — a queue with many rows (or long image URLs) can otherwise blow past
 * Ably's per-message size cap and fail to publish at all */
function chunkItems(items: QueueItem[], config: Config): QueueItem[][] {
  const overheadBytes = jsonBytes(config) + 200;
  const chunks: QueueItem[][] = [];
  let current: QueueItem[] = [];
  let currentBytes = overheadBytes;

  for (const item of items) {
    const itemBytes = jsonBytes(item);
    if (current.length && currentBytes + itemBytes > PRINT_BATCH_MAX_BYTES) {
      chunks.push(current);
      current = [];
      currentBytes = overheadBytes;
    }
    current.push(item);
    currentBytes += itemBytes;
  }
  if (current.length) chunks.push(current);
  return chunks.length ? chunks : [[]];
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

  async publish(config: Config, items: QueueItem[], onProgress?: PublishProgress): Promise<void> {
    const client = this.getClient();
    await this.waitConnected(client);
    const channel = client.channels.get(PRINT_TAGS_CHANNEL);

    const chunks = chunkItems(items, config);
    const batchTotal = chunks.length;
    const batchId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    for (let i = 0; i < chunks.length; i++) {
      const payload: PrintPayload = {
        v: PRINT_PAYLOAD_VERSION,
        ts: Date.now(),
        batchId,
        batchIndex: i,
        batchTotal,
        config,
        items: chunks[i],
      };
      await channel.publish(PRINT_EVENT_NAME, payload);
      onProgress?.(i + 1, batchTotal);
    }
  }
}

export const printBridge = new PrintBridge();

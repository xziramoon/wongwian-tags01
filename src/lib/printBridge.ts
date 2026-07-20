import mqtt, { type MqttClient } from 'mqtt';
import type { Config, QueueItem } from '../types';
import { PRINT_TAGS_TOPIC, PRINT_PAYLOAD_VERSION } from '../constants';

export interface PrintPayload {
  v: number;
  ts: number;
  config: Config;
  items: QueueItem[];
}

/* publishes the current queue+config to the remote TAG_PRINTER receiver over MQTT */
class PrintBridge {
  private client: MqttClient | null = null;
  private connecting: Promise<MqttClient> | null = null;

  private connect(): Promise<MqttClient> {
    if (this.client?.connected) return Promise.resolve(this.client);
    if (this.connecting) return this.connecting;

    this.connecting = new Promise((resolve, reject) => {
      const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
      const onConnect = () => {
        client.off('error', onError);
        this.client = client;
        this.connecting = null;
        resolve(client);
      };
      const onError = (err: Error) => {
        client.off('connect', onConnect);
        this.connecting = null;
        reject(err);
      };
      client.once('connect', onConnect);
      client.once('error', onError);
    });
    return this.connecting;
  }

  async publish(config: Config, items: QueueItem[]): Promise<void> {
    const client = await this.connect();
    const payload: PrintPayload = { v: PRINT_PAYLOAD_VERSION, ts: Date.now(), config, items };
    return new Promise((resolve, reject) => {
      client.publish(PRINT_TAGS_TOPIC, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const printBridge = new PrintBridge();

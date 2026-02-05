import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Upstash Redis env vars are missing');
    }

    this.client = new Redis({
      url,
      token,
    });
  }

  async get<T = any>(key: string): Promise<T | null> {
    return this.client.get<T>(key);
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, { ex: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delMany(keys: string[]): Promise<void> {
    if (!keys || keys.length === 0) return;
    await this.client.del(...keys);
  }


  async deleteByPattern(pattern: string): Promise<void> {
    // Obtenemos todas las keys que matchean el patrón
    const keys = await this.client.keys(pattern);

    if (!keys || keys.length === 0) {
      return;
    }

    await this.delMany(keys);
  }

}
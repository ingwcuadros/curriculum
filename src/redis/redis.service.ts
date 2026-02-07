import { Injectable, OnModuleDestroy } from '@nestjs/common';
import IORedis, { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    // Opción 1: Usar una URL completa (recomendado)
    const redisUrl = process.env.REDIS_URL;

    // Opción 2: Usar host/port/password separados
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;
    const redisPassword = process.env.REDIS_PASSWORD;

    if (redisUrl) {
      this.client = new IORedis(redisUrl, {
        // Opcional: configs extra
        maxRetriesPerRequest: 3,
      });
    } else if (redisHost && redisPort) {
      this.client = new IORedis({
        host: redisHost,
        port: parseInt(redisPort, 10),
        password: redisPassword || undefined,
        // tls: {} // solo si Dockploy expone Redis con TLS
      });
    } else {
      throw new Error(
        'Redis env vars are missing. Set REDIS_URL or REDIS_HOST/REDIS_PORT',
      );
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T = any>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (raw === null) return null;

    // Intentar parsear JSON para mantener compatibilidad con Upstash
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Si no es JSON, devolver la string tal cual
      return raw as unknown as T;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
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
    // Ojo: KEYS bloquea Redis si hay muchas keys, pero
    // es equivalente a lo que ya tenías con Upstash.
    const keys = await this.client.keys(pattern);

    if (!keys || keys.length === 0) {
      return;
    }

    await this.delMany(keys);
  }
}
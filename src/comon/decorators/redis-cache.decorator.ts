import { SetMetadata } from '@nestjs/common';

export const REDIS_CACHE_METADATA_KEY = 'redis_cache_metadata';

export interface RedisCacheOptions {
    ttl?: number;   // segundos
    key?: string;   // puede incluir {id}, {slug}, etc.
}

/**
 * @RedisCache(ttl, key?)
 *
 * Ejemplos:
 *  @RedisCache(300, 'products:list')
 *  @RedisCache(600, 'products:detail:{id}')
 */
export const RedisCache = (ttl?: number, key?: string) =>
    SetMetadata(REDIS_CACHE_METADATA_KEY, { ttl, key } as RedisCacheOptions);
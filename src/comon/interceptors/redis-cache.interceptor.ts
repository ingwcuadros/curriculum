import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Request } from 'express';

import { RedisService } from '../../redis/redis.service';
import {
    REDIS_CACHE_METADATA_KEY,
    RedisCacheOptions,
} from '../decorators/redis-cache.decorator';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
    // TTL por defecto si el decorador no lo especifica
    private readonly defaultTtl = 60; // 1 minuto

    constructor(
        private readonly reflector: Reflector,
        private readonly redisService: RedisService,
    ) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const handler = context.getHandler();
        const clazz = context.getClass();

        const cacheOptions = this.reflector.getAllAndOverride<RedisCacheOptions>(
            REDIS_CACHE_METADATA_KEY,
            [handler, clazz],
        );

        // Si el endpoint NO tiene @RedisCache => no se cachea
        if (!cacheOptions) {
            return next.handle();
        }

        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();

        const key = this.buildCacheKey(request, cacheOptions);
        const ttl = cacheOptions.ttl ?? this.defaultTtl;

        return from(this.redisService.get(key)).pipe(
            switchMap((cached) => {
                if (cached !== null && cached !== undefined) {
                    // Respuesta cacheada
                    return of(cached);
                }

                // No hay cache -> ejecuta endpoint y guarda resultado
                return next.handle().pipe(
                    tap((data) => {
                        this.redisService.set(key, data, ttl);
                    }),
                );
            }),
        );
    }

    private buildCacheKey(
        request: Request,
        options: RedisCacheOptions,
    ): string {
        if (options.key) {
            // Reemplazar placeholders {param} con valores del request
            return this.resolveTemplateKey(options.key, request);
        }

        // Fallback: METHOD + URL sin query params
        const method = request.method;
        const url = (request.originalUrl || request.url).split('?')[0];

        return `cache:${method}:${url}`;
    }

    private resolveTemplateKey(template: string, request: Request): string {
        // Reemplaza {param} por request.params[param] o query/body si aplica
        return template.replace(/\{(\w+)\}/g, (_, paramName) => {
            const value =
                request.params?.[paramName] ??
                (request.query as any)?.[paramName] ??
                (request.body as any)?.[paramName];

            return value !== undefined ? String(value) : `unknown-${paramName}`;
        });
    }
}
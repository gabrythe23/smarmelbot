import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          readyLog: true,
          config: {
            url: configService.get('redis.url'),
            username: configService.get('redis.username'),
            password: configService.get('redis.password'),
          },
        };
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}

import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { RedisCacheModule } from '../redis/redis-cache.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [RedisCacheModule, HttpModule],
  providers: [BotUpdate],
})
export class BotModule {}

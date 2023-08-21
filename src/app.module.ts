import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './modules/bot/bot.module';
import { RedisCacheModule } from './modules/redis/redis-cache.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { TelegrafExceptionFilter } from './telegraf-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: './config/.develop.env',
      load: [configuration],
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('botToken'),
        include: [BotModule],
      }),
      inject: [ConfigService],
    }),
    BotModule,
    RedisCacheModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: TelegrafExceptionFilter,
    },
  ],
})
export class AppModule {}

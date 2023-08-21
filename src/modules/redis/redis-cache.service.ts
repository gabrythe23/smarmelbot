import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { ConfigService } from '@nestjs/config';

export enum CacheKey {
  LAST_TXT_MESSAGE = 'LAST_TXT_MESSAGE',
  SHADOW_BAN = 'SHADOW_BAN',
  MSG_COUNTER = 'MSG_COUNTER',
  SHADOW_BAN_COUNTER = 'SHADOW_BAN_COUNTER',
  USER_LIST = 'USER_LIST',
  SELFIE_DAY = 'SELFIE_DAY',
  CHAT_ID = 'CHAT_ID',
  ADMIN_TITLE_LIST = 'ADMIN_TITLE_LIST',
  ADMIN_LIST = 'ADMIN_LIST',
  TOPIC_TO_OPEN_FROM_REPLY = 'TOPIC_TO_OPEN_FROM_REPLY',
  REQUEST_OPEN_TOPIC_FROM_PINNED = 'REQUEST_OPEN_TOPIC_FROM_PINNED',
}

interface SelfieDay {
  date: number;
  hour: number;
  minute: number;
}

@Injectable()
export class RedisCacheService {
  private readonly shadowBanEta: number;
  private readonly lastMessageSameEta: number;
  private readonly logger = new Logger(RedisCacheService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.shadowBanEta = configService.get('shadowBanEta');
    this.lastMessageSameEta = configService.get('lastMessageSameEta');
  }

  async getLastUserMessage(userId: number): Promise<string | undefined> {
    const data = await this.redis.get(
      this.key(CacheKey.LAST_TXT_MESSAGE, `${userId}`),
    );
    return data ? data : undefined;
  }

  async setLastUserMessage(userId: number, msg: string): Promise<void> {
    await this.redis.set(
      this.key(CacheKey.LAST_TXT_MESSAGE, `${userId}`),
      msg,
      'EX',
      this.lastMessageSameEta,
    );
  }

  async getShadowBan(userId: number): Promise<boolean> {
    const data = await this.redis.get(
      this.key(CacheKey.SHADOW_BAN, `${userId}`),
    );
    return !!JSON.parse(data);
  }

  async setShadowBan(userId: number): Promise<void> {
    await this.redis.set(
      this.key(CacheKey.SHADOW_BAN, `${userId}`),
      JSON.stringify(true),
      'EX',
      this.shadowBanEta,
    );
    await this.redis.incr(this.key(CacheKey.SHADOW_BAN_COUNTER, `${userId}`));
  }

  async msgCounter(userId: number): Promise<number> {
    const inTimeSpan: number[] = [Math.floor(Date.now() / 1000)];
    const expTime = 60;
    const key = this.key(CacheKey.MSG_COUNTER, `${userId}`);

    const data = await this.redis.get(key);
    if (data)
      inTimeSpan.push(
        ...(JSON.parse(data) as number[]).filter(
          (r) => r >= Math.floor(Date.now() / 1000) - expTime,
        ),
      );
    await this.redis.set(key, JSON.stringify(inTimeSpan), 'EX', expTime);
    return inTimeSpan.length;
  }

  async addUserToList(
    chatId: number,
    userName: string,
    userId: number,
  ): Promise<void> {
    await this.redis.hset(
      this.key(CacheKey.USER_LIST, `${chatId}`),
      userName,
      userId,
    );
  }

  async getUserToList(
    chatId: number,
    userName: string,
  ): Promise<number | undefined> {
    const data = await this.redis.hget(
      this.key(CacheKey.USER_LIST, `${chatId}`),
      userName,
    );
    return data ? Number(data) : undefined;
  }

  async getSelfieDay(): Promise<SelfieDay | undefined> {
    const data = await this.redis.get(this.key(CacheKey.SELFIE_DAY));
    return data ? JSON.parse(data) : undefined;
  }

  async setSelfieDay(data: SelfieDay): Promise<void> {
    await this.redis.set(this.key(CacheKey.SELFIE_DAY), JSON.stringify(data));
  }

  async getChatId(): Promise<string | undefined> {
    const data = await this.redis.get(this.key(CacheKey.CHAT_ID));
    return data ? data : undefined;
  }

  async setAdminTitle(
    chatId: number,
    userName: string,
    title: string,
  ): Promise<void> {
    await this.redis.hset(
      this.key(CacheKey.ADMIN_TITLE_LIST, `${chatId}`),
      userName,
      title,
    );
  }

  async getAdminTitle(
    chatId: string,
    userName: string,
  ): Promise<string | undefined> {
    const data = await this.redis.hget(
      this.key(CacheKey.ADMIN_TITLE_LIST, `${chatId}`),
      userName,
    );
    return data ? data : undefined;
  }

  async getAdminList(chatId: string): Promise<string[]> {
    const data = await this.redis.get(
      this.key(CacheKey.ADMIN_LIST, `${chatId}`),
    );
    return data ? JSON.parse(data) : [];
  }

  async setAdminList(chatId: string, data: string[]): Promise<void> {
    await this.redis.set(
      this.key(CacheKey.ADMIN_LIST, `${chatId}`),
      JSON.stringify(data),
    );
  }

  async getRequestOpenTopicFromPinned(
    chatId: number,
  ): Promise<string | undefined> {
    const data = await this.redis.get(
      this.key(CacheKey.REQUEST_OPEN_TOPIC_FROM_PINNED, `${chatId}`),
    );
    return data ? data : undefined;
  }

  async setRequestOpenTopicFromPinned(
    chatId: number,
    topic: string,
  ): Promise<void> {
    await this.redis.set(
      this.key(CacheKey.REQUEST_OPEN_TOPIC_FROM_PINNED, `${chatId}`),
      topic,
      'EX',
      600,
    );
  }

  private key(name: CacheKey, param?: string): string {
    if (!param) return `${name}`;
    const key = `${name}:${param}`;
    this.logger.verbose(`Key: ${key}`);
    return key;
  }
}

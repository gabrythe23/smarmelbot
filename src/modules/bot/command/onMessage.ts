import { Context } from 'telegraf';
import { getKeyFromName } from './common';
import { RedisCacheService } from '../../redis/redis-cache.service';
import { Logger } from '@nestjs/common';

export const onMessage = async (
  ctx: Context,
  redisClient: RedisCacheService,
  userId: number,
  rawMsg: string,
): Promise<void> => {
  const userName =
    ctx.from.username ||
    ctx.from.last_name ||
    ctx.from.first_name ||
    `${ctx.from.id}`;
  const msgId = ctx.message.message_id;
  new Logger(userName).verbose(`[${msgId}] ${rawMsg}`);
  const sameAsLastMessage = rawMsg
    ? (await redisClient.getLastUserMessage(userId)) === rawMsg
    : false;

  if (!(await redisClient.getUserToList(ctx.chat.id, ctx.from.username)))
    await redisClient.addUserToList(
      ctx.chat.id,
      getKeyFromName(ctx),
      ctx.from.id,
    );
  await redisClient.setLastUserMessage(userId, rawMsg);
  if (sameAsLastMessage) await ctx.deleteMessage(ctx.message.message_id);
  else await redisClient.setLastUserMessage(userId, rawMsg);
};

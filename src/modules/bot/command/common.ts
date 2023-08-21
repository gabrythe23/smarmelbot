import { Message } from 'typegram';
import { Context } from 'telegraf';
import { Logger } from '@nestjs/common';

const logger = new Logger('Common');

export const removeMessageAfterTime = (
  ctx: Context,
  sendMsg: Message.TextMessage,
  second: number,
): void => {
  logger.verbose(`Removing message after ${second} seconds`);
  setTimeout(
    async () =>
      await ctx.telegram.deleteMessage(sendMsg.chat.id, sendMsg.message_id),
    second * 1000,
  );
};

export const getKeyFromName = (ctx: Context): string => {
  logger.verbose(
    `Getting key from name ${ctx.from.username} or ${ctx.from.first_name} ${ctx.from.last_name}`,
  );
  if (ctx.from.username) return ctx.from.username;
  if (ctx.from.first_name && ctx.from.last_name)
    return `${ctx.from.first_name} ${ctx.from.last_name}`;
  return `${ctx.from.first_name}${ctx.from.id}`;
};

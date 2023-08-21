import {
  Command,
  Ctx,
  InjectBot,
  Message,
  On,
  Sender,
  Update,
} from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { Logger, OnModuleInit } from '@nestjs/common';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ConfigService } from '@nestjs/config';
import { getCommandMsg, getRandomInt } from '../../utils';
import {
  adminTitle,
  appetizer,
  BotCommands,
  commandList,
  continueCheckSelfieDay,
  createTopic,
  onMessage,
  promoteUser,
  randomMember,
  removeMessageAfterTime,
  trivial,
  yesNo,
  youtubeMp3,
} from './command';
import { HttpService } from '@nestjs/axios';

@Update()
export class BotUpdate implements OnModuleInit {
  private readonly msgPerMinute: number;
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly redisClient: RedisCacheService,
    private readonly configService: ConfigService,
    @InjectBot() private bot: Telegraf<Context>,
    private readonly httpService: HttpService,
  ) {
    this.msgPerMinute = this.configService.get('msgPerMinute');
  }

  async onModuleInit() {
    this.logger.log('Registering commands');
    await this.bot.telegram.deleteMyCommands();
    await this.bot.telegram.setMyCommands(commandList);
    continueCheckSelfieDay(this.bot, this.redisClient);
    promoteUser(this.bot, this.redisClient).catch((e) => this.logger.error(e));
  }

  @On('pinned_message')
  async onMessage(
    @Sender('username') username: string,
    @Sender('id') id: number,
    @Ctx() ctx: Context,
    @Message('pinned_message') { text }: { text: string },
  ): Promise<void> {
    this.logger.log(`PINNED_MESSAGE: ${ctx.message.chat.id}`);
    // reply to pinned message with button open topic

    await this.redisClient.setRequestOpenTopicFromPinned(
      ctx.message.chat.id,
      text,
    );
    await ctx.reply(`📌 Vuoi aprire il topic?`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📌 Apri il topic',
              callback_data: 'open_topic_from_pinned_message',
            },
          ],
        ],
      },
    });
  }

  // callback open topic from pinned message
  @On('callback_query')
  async onCallbackQuery(
    @Sender('username') username: string,
    @Sender('id') id: number,
    @Ctx() ctx: Context,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const {
      data,
      message,
    }: { data: string; message: { message_id: number; chat: { id: number } } } =
      ctx.callbackQuery;
    this.logger.log(`CALLBACK_QUERY: ${data}`);
    if (data === 'open_topic_from_pinned_message') {
      const topicName = await this.redisClient.getRequestOpenTopicFromPinned(
        message.chat.id,
      );
      await ctx.deleteMessage(message.message_id);
      if (topicName) await createTopic(ctx, topicName);
    }
  }

  @Command(BotCommands.YES_NO_POLL)
  async yesNo(
    @Sender('username') username: string,
    @Sender('id') id: number,
    @Message('text') rawMsg: string,
    @Ctx() ctx: Context,
  ): Promise<void> {
    this.logger.log(
      `${BotCommands.YES_NO_POLL} user ${
        ctx.from.username
      } question ${getCommandMsg(rawMsg)}`,
    );
    await yesNo(ctx, username, rawMsg);
  }

  @Command(BotCommands.APPETIZER)
  async appetizer(
    @Sender('username') username: string,
    @Sender('id') id: number,
    @Ctx() ctx: Context,
  ): Promise<void> {
    this.logger.log(`${BotCommands.APPETIZER} user ${ctx.from.username}`);
    await appetizer(ctx, username);
  }

  @Command(BotCommands.DICE)
  async random(
    @Sender('id') id: number,
    @Ctx() ctx: Context,
    @Message('text') rawMsg: string,
  ): Promise<void> {
    this.logger.log(`${BotCommands.DICE} user ${ctx.from.username}`);
    await ctx.deleteMessage(ctx.message.message_id);
    await ctx.reply(
      `Random: ${getRandomInt(Math.abs(Number(getCommandMsg(rawMsg)) || 6))}`,
    );

    removeMessageAfterTime(
      ctx,
      await ctx.reply(
        `Random: ${getRandomInt(Math.abs(Number(getCommandMsg(rawMsg)) || 6))}`,
      ),
      20,
    );
  }

  @Command(BotCommands.RANDOM_MEMBER)
  async randomMember(
    @Ctx() ctx: Context,
    @Message('text') rawMsg: string,
  ): Promise<void> {
    this.logger.log(`${BotCommands.RANDOM_MEMBER} user ${ctx.from.username}`);
    await randomMember(ctx);
  }

  @Command(BotCommands.TRIVIAL)
  async trivial(@Ctx() ctx: Context): Promise<void> {
    this.logger.log(`${BotCommands.TRIVIAL} user ${ctx.from.username}`);
    await trivial(ctx);
  }

  @Command(BotCommands.YT_MP3_DOWNLOAD)
  async ytMp3(
    @Ctx() ctx: Context,
    @Message('text') link: string,
  ): Promise<void> {
    this.logger.log(
      `${BotCommands.YT_MP3_DOWNLOAD} user ${ctx.from.username} and link ${link}`,
    );
    await youtubeMp3(ctx, link);
  }

  @Command(BotCommands.ADMIN_TITLE)
  async adminTitle(
    @Ctx() ctx: Context,
    @Message('text') rawMsg: string,
  ): Promise<void> {
    this.logger.log(`${BotCommands.ADMIN_TITLE} user ${ctx.from.username}`);
    await adminTitle(ctx, rawMsg, this.redisClient);
  }

  @Command(BotCommands.TOPIC)
  async createTopic(
    @Ctx() ctx: Context,
    @Message('text') rawMsg: string,
  ): Promise<void> {
    this.logger.log(`Create topic: ${rawMsg} user ${ctx.from.username}`);
    await createTopic(ctx, getCommandMsg(rawMsg));
  }

  @On('message')
  async saveLastMessage(
    @Sender('first_name') firstName: string,
    @Sender('id') userId: number,
    @Ctx() ctx: Context,
    @Message('text') rawMsg: string,
  ): Promise<any> {
    this.logger.log(`Message: ${rawMsg} user ${ctx.from.username}`);
    await onMessage(ctx, this.redisClient, userId, rawMsg);
  }
}

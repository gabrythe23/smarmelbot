import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { TelegrafException, TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { RedisCacheService } from './modules/redis/redis-cache.service';
import { ConfigService } from '@nestjs/config';
import { ChatPermissions } from 'typegram';
import { ExtraPromoteChatMember } from 'telegraf/typings/telegram-types';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private readonly msgPerMinute: number;

  constructor(
    private readonly redisClient: RedisCacheService,
    private readonly configService: ConfigService,
  ) {
    this.msgPerMinute = this.configService.get('msgPerMinute');
  }

  static createChatPermissions(can: boolean): ChatPermissions {
    return {
      can_send_messages: can,
      can_send_other_messages: can,
      can_add_web_page_previews: can,
      can_change_info: can,
      can_invite_users: can,
      can_pin_messages: can,
      can_send_polls: can,
      can_send_audios: can,
      can_manage_topics: can,
      can_send_photos: can,
      can_send_documents: can,
      can_send_videos: can,
      can_send_video_notes: can,
      can_send_voice_notes: can,
    };
  }

  static createExtraPromptChatMember(can: boolean): ExtraPromoteChatMember {
    return {
      can_change_info: can,
      can_delete_messages: can,
      can_invite_users: can,
      can_pin_messages: can,
      can_promote_members: can,
      can_restrict_members: can,
      can_manage_chat: can,
      can_manage_video_chats: can,
      can_edit_messages: can,
      can_post_messages: can,
      is_anonymous: false,
      can_manage_topics: can,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context);
    const tgContext = ctx.getContext<Context>();
    const isBanned = await this.redisClient.getShadowBan(tgContext.from.id);

    const msgCounter = await this.redisClient.msgCounter(tgContext.from.id);

    // if remains 2 message from this.msgPerMinute
    if (msgCounter == this.msgPerMinute - 2) {
      await tgContext.reply(
        'Ti rimangono 2 messaggi da inviare prima di essere bannato',
      );
    }
    if (msgCounter == this.msgPerMinute - 1) {
      await tgContext.reply(
        'Ti rimane 1 messaggio da inviare prima di essere bannato',
      );
    }

    const limit = msgCounter >= this.msgPerMinute;
    // this.logger.log(tgContext.getM)
    if (isBanned) throw new TelegrafException('You are banned');

    if (!(await this.checkLimitAndBan(tgContext, limit)))
      throw new TelegrafException('You are banned');

    return true;
  }

  async checkLimitAndBan(ctx: Context, limit): Promise<boolean> {
    const userId = ctx.from.id;
    const shadowBan = await this.redisClient.getShadowBan(userId);

    if (limit && !shadowBan) {
      await this.kill(
        ctx.from.first_name || ctx.from.username,
        ctx.from.id,
        ctx,
      );
      return false;
    } else if (limit) return false;
    return true;
  }

  async kill(firstName: string, userId: number, ctx: Context): Promise<void> {
    try {
      // remove user from admin list
      await ctx.promoteChatMember(
        userId,
        AuthGuard.createExtraPromptChatMember(false),
      );
      // restrict user from sending messages
      await ctx.restrictChatMember(userId, {
        permissions: AuthGuard.createChatPermissions(false),
      });
      // await this.redisClient.setShadowBan(userId);
      await ctx.replyWithAnimation(
        'https://tenor.com/it/view/no-consuela-family-guy-gif-7535890',
      );
      await ctx.reply(
        `Hai ${
          this.configService.get('shadowBanEta') / 60
        } minuti di tempo sorry 🥲`,
      );
      // await ctx.replyWithMarkdown(`Pensa alle notifiche please 🥲`);
      setTimeout(async () => {
        await ctx.restrictChatMember(userId, {
          permissions: AuthGuard.createChatPermissions(true),
        });
        await ctx.promoteChatMember(
          userId,
          AuthGuard.createExtraPromptChatMember(true),
        );
      }, this.configService.get('shadowBanEta') * 1000);
    } catch (e) {
      this.logger.error(e);
    }
  }
}

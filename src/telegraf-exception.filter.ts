import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const telegrafHost = TelegrafArgumentsHost.create(host);
    const ctx = telegrafHost.getContext<Context>();
    try {
      await ctx.deleteMessage(ctx?.message?.message_id);
    } catch (err) {
      console.log(err.message);
    }
    // await ctx.replyWithHTML(`<b>Error</b>: ${exception.message}`);
  }
}

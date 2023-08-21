import {
  getCommandMsg,
  getRandomInt,
  parseHtmlEntities,
  shuffleArray,
} from '../../../utils';
import { Context } from 'telegraf';
import { removeMessageAfterTime } from './common';
import ytdl from 'ytdl-core';
import * as ffmpeg from 'fluent-ffmpeg';
import readline from 'readline';
import { readFileSync, unlinkSync } from 'fs';
import { RedisCacheService } from '../../redis/redis-cache.service';
import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('Functions');

export const yesNo = async (
  ctx: Context,
  userName: string,
  rawMsg: string,
): Promise<void> => {
  logger.verbose(`YES_NO_POLL: ${rawMsg} (${ctx.message.chat.id})`);
  await ctx.deleteMessage(ctx.message.message_id);
  const question = getCommandMsg(rawMsg);
  if (!question && !question.length) return;
  await ctx.sendPoll(`@${userName} chiede:\n\n${question}`, ['👍', '👎'], {
    is_anonymous: false,
  });
};

export const appetizer = async (
  ctx: Context,
  username: string,
): Promise<void> => {
  logger.verbose(`APPETIZER: ${username} (${ctx.message.chat.id})`);
  await ctx.deleteMessage(ctx.message.message_id);
  await ctx.sendPoll(
    `@${username} chiede se qualcuno vuole fare aperitivo! 🍻`,
    ['🍻🍁🎮', '👎'],
    {
      is_anonymous: false,
    },
  );
};

export const dice = async (ctx: Context): Promise<void> => {
  logger.verbose(`DICE: ${ctx.message.chat.id}`);
  await ctx.deleteMessage(ctx.message.message_id);
  await ctx.sendDice();
};

export const randomMember = async (ctx: Context): Promise<void> => {
  logger.verbose(`RANDOM_MEMBER: ${ctx.message.chat.id}`);
  await ctx.deleteMessage(ctx.message.message_id);
  const admins = await ctx.getChatAdministrators();
  const realAdmins: Array<{ id: number; name: string }> = admins
    .filter((r) => !r.user.is_bot)
    .map(({ user }) => ({ id: user.id, name: `${user.username}` }));
  const i = getRandomInt(realAdmins.length - 1);

  removeMessageAfterTime(
    ctx,
    await ctx.replyWithMarkdown(
      `[${realAdmins[i].name}](tg://user?id=${realAdmins[i].id}) sei il prescelto...`,
    ),
    180,
  );
};

export const trivial = async (ctx: Context): Promise<void> => {
  logger.verbose(`TRIVIAL: ${ctx.message.chat.id}`);
  await ctx.deleteMessage(ctx.message.message_id);
  const { data } = await axios.get(
    'https://opentdb.com/api.php?amount=1&difficulty=medium',
  );
  const question = data.results[0];
  const options = shuffleArray([
    question.correct_answer,
    ...question.incorrect_answers,
  ]);
  await ctx.sendQuiz(
    parseHtmlEntities(question.question),
    options.map((r) => parseHtmlEntities(r)),
    {
      allows_multiple_answers: false,
      is_anonymous: false,
      correct_option_id: options.findIndex(
        (r) => r === question.correct_answer,
      ),
      explanation: question.correct_answer,
    },
  );
};

export const youtubeMp3 = async (
  ctx: Context,
  rawMsg: string,
): Promise<void> => {
  logger.verbose(`YOUTUBE_MP3: ${rawMsg} (${ctx.message.chat.id})`);
  const url = getCommandMsg(rawMsg).trimEnd().trimStart();
  const msg = await ctx.sendMessage('Scarico....');
  try {
    const id = ytdl.getURLVideoID(url);
    const infos = await ytdl.getInfo(url);
    const stream = ytdl(id, {
      quality: 'highestaudio',
    });
    const filename = (infos?.videoDetails?.title || id).replace(
      /[^a-zA-Z0-9 ]/g,
      '',
    );
    const path = `${__dirname}/${filename}.mp3`;
    ffmpeg(stream)
      .audioBitrate(128)
      .save(path)
      .on('progress', () => readline.cursorTo(process.stdout, 0))
      .on('end', async () => {
        await ctx.sendAudio(
          {
            source: readFileSync(path),
            filename: `${filename}.mp3`,
          },
          {
            performer: infos?.videoDetails?.author?.name || '',
            duration: Number(infos.videoDetails.lengthSeconds),
            thumb: { url: infos.videoDetails.thumbnails[0].url },
            title: filename,
          },
        );
        await ctx.deleteMessage(ctx.message.message_id);
        await ctx.deleteMessage(msg.message_id);
        unlinkSync(path);
      });
  } catch (err) {
    await ctx.deleteMessage(msg.message_id);
    await ctx.reply('Non son riuscito! :(');
  }
};

export const adminTitle = async (
  ctx: Context,
  rawMsg: string,
  redisClient: RedisCacheService,
): Promise<void> => {
  logger.verbose(`ADMIN_TITLE: ${rawMsg} (${ctx.message.chat.id})`);

  rawMsg = getCommandMsg(rawMsg).trim();
  if (!/^[a-zA-Z0-9 ]+$/.test(rawMsg)) {
    await ctx.reply('Non puoi usare caratteri speciali');
    return;
  }
  if (rawMsg.length > 16) {
    await ctx.reply('Non puoi usare più di 16 caratteri');
    return;
  }

  // add title to db
  await redisClient.setAdminTitle(ctx.chat.id, `${ctx.from.id}`, rawMsg);
  // set title for admin
  await ctx.setChatAdministratorCustomTitle(ctx.from.id, rawMsg);
};

export const createTopic = async (
  ctx: Context,
  topic: string,
): Promise<void> => {
  logger.verbose(`CREATE_TOPIC: ${topic} (${ctx?.message?.chat?.id})`);
  topic = topic.trimEnd().trimStart();
  if (topic.length > 255) {
    await ctx.reply('Non puoi usare più di 255 caratteri');
    return;
  }
  // create telegram topic for group
  await ctx.createForumTopic(topic);
};

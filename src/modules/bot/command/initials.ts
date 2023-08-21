import { RedisCacheService } from '../../redis/redis-cache.service';
import { Context, Telegraf } from 'telegraf';
import { daysInMonth, getRandomInt } from '../../../utils';
import ical from 'node-ical';
import axios from 'axios';
import { AuthGuard } from '../../../auth.guard';
import { Logger } from '@nestjs/common';

const logger = new Logger('Initials');

export const bannedDates = async (): Promise<Date[]> => {
  logger.log('Getting banned dates');
  const eventsDate: Array<Date> = [];
  const url =
    'https://www.webcal.guru/it-IT/scarica_calendario?calendar_instance_id=66';
  const ics = await axios.get(url);
  const events = ical.parseICS(ics.data);
  for (const [, value] of Object.entries(events)) {
    if (!value.type || value?.type !== 'VEVENT') continue;

    const { start } = value;
    // set start date to 12:00 pm to avoid timezone issues
    start.setHours(12, 0, 0, 0);
    eventsDate.push(start);
  }
  // filter date for only next month events
  eventsDate.filter((r) => r.getMonth() === new Date().getMonth() + 1);
  // add every sat and sun to the list
  for (let i = 1; i <= 31; i++) {
    const date = new Date(new Date().getFullYear(), new Date().getMonth(), i);
    if (date.getDay() === 0 || date.getDay() === 6) eventsDate.push(date);
  }
  return eventsDate;
};

export const continueCheckSelfieDay = (
  bot: Telegraf<Context>,
  redisClient: RedisCacheService,
): void => {
  logger.log('Starting checkSelfieDay');
  setInterval(async () => {
    await checkSelfieDay(bot, redisClient);
  }, 600000);
};

export const checkSelfieDay = async (
  bot: Telegraf<Context>,
  redisClient: RedisCacheService,
): Promise<void> => {
  logger.log('Checking selfie day');
  const selfieDay = await redisClient.getSelfieDay();
  const chatId = await redisClient.getChatId();
  if (!selfieDay || !chatId) return;

  const now = new Date();
  const nowDate = now.toLocaleDateString('it-IT');
  const nowHour = now.getHours() + 1;

  const selfieDayDate = new Date(selfieDay.date).toLocaleDateString('it-IT');
  const selfieDayHour = selfieDay.hour;

  if (nowDate === selfieDayDate && Number(nowHour) >= Number(selfieDayHour)) {
    const msg = await bot.telegram.sendMessage(
      chatId,
      'Oggi è il giorno del selfie! 📸',
    );
    // pin message for 12 hours and notify all users
    await bot.telegram.pinChatMessage(chatId, msg.message_id, {
      disable_notification: false,
    });

    await setSelfieDay(redisClient);
  }
};

export const setSelfieDay = async (
  redisClient: RedisCacheService,
): Promise<void> => {
  logger.log('Setting selfie day');
  const now = new Date().toLocaleDateString('it-IT');
  const bannedDate = (await bannedDates()).map((r) =>
    r.toLocaleDateString('it-IT'),
  );
  const currentMonthLength = daysInMonth(
    new Date().getMonth() + 2,
    new Date().getFullYear(),
  );
  // random hour between 10:00 am and 6:00 pm
  const randomHour = getRandomInt(8) + 10;
  // random minute between with 10 minutes interval
  const randomMinute = getRandomInt(6) * 10;

  let randomDay: Date | undefined;
  let isFound = false;
  while (!isFound) {
    randomDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 2,
      getRandomInt(currentMonthLength),
      randomHour,
      randomMinute,
    );
    const toLocale = randomDay.toLocaleDateString('it-IT');
    if (!bannedDate.includes(toLocale) && toLocale !== now) isFound = true;
  }

  await redisClient.setSelfieDay({
    date: randomDay.setHours(12, 0),
    hour: randomHour,
    minute: randomMinute,
  });
};

export const promoteUser = async (
  bot: Telegraf<Context>,
  redisClient: RedisCacheService,
): Promise<void> => {
  logger.log('Promoting user');
  const chatId = await redisClient.getChatId();
  const admins = await redisClient.getAdminList(chatId);
  // promote to admin all the users in the admin list
  for (const admin of admins) {
    logger.log(`Promoting user ${admin} to admin in chat ${chatId}`);
    try {
      await bot.telegram.promoteChatMember(
        chatId,
        Number(admin),
        AuthGuard.createExtraPromptChatMember(true),
      );
      const title = await redisClient.getAdminTitle(chatId, admin);
      if (!title) continue;
      logger.log(`Setting title ${title} to user ${admin}`);
      await bot.telegram.setChatAdministratorCustomTitle(
        chatId,
        Number(admin),
        title,
      );
    } catch (e) {
      console.log(e);
    }
  }
};

import { getEnv } from './utils';

export default () => ({
  botToken: getEnv('BOT_TOKEN', ''),
  botName: getEnv('BOT_NAME', ''),
  msgPerMinute: getEnv('MSG_PER_MINUTE', 10),
  shadowBanEta: getEnv('SHADOWBAN_ETA', 180),
  lastMessageSameEta: getEnv('LAST_MESSAGE_SAME_ETA', 900),
  redis: {
    url: getEnv('REDIS_URL', ''),
    username: getEnv('REDIS_USERNAME', ''),
    password: getEnv('REDIS_PASSWORD', ''),
  },
});

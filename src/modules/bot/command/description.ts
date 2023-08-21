export enum BotCommands {
  YES_NO_POLL = 'yesnopoll',
  DICE = 'random_number',
  RANDOM_MEMBER = 'random_member',
  TRIVIAL = 'trivial',
  APPETIZER = 'aperitivo',
  YT_MP3_DOWNLOAD = 'ytmp3',
  ADMIN_TITLE = 'admin_title',
  TOPIC = 'topic',
}

export const commandList = [
  {
    command: BotCommands.YES_NO_POLL,
    description:
      'devi mettere una fra dopo e crea automaticamente un sondaggio si no 😉',
  },
  {
    command: BotCommands.APPETIZER,
    description: 'aperitiviamo?',
  },
  {
    command: BotCommands.DICE,
    description: 'numero casuale fino al massimo indicato oppure fino 6 ',
  },
  {
    command: BotCommands.RANDOM_MEMBER,
    description:
      'torna un membro a caso del gruppo, puoi aggiungere testo e verrà accodato a...sarai il prescelto...',
  },
  {
    command: BotCommands.TRIVIAL,
    description: 'fa una domanda stile trivial pursuit!',
  },
  {
    command: BotCommands.YT_MP3_DOWNLOAD,
    description: 'paste link for mp3 download',
  },
  {
    command: BotCommands.ADMIN_TITLE,
    description: 'imposta titolo admin',
  },
  {
    command: BotCommands.TOPIC,
    description: 'crea topic',
  },
];

type CastType = string | number | boolean;

export const getEnv = (
  id: string,
  or?: CastType,
): string | number | boolean => {
  const processVar = process.env[id];
  if (!or) return processVar;
  else if (processVar === undefined) return or;
  else {
    switch (typeof or) {
      case 'boolean':
        return !!processVar;
      case 'number':
        return Number(processVar);
      case 'string':
        return processVar;
    }
  }
};

export const getCommandMsg = (rawMsg: string): string | undefined => {
  const splitter = rawMsg.split(' ');
  if (splitter.length === 1) return undefined;

  const final = splitter.splice(1).join(' ').trimEnd().trimStart();
  return final.length === 0 ? undefined : final;
};

export const getRandomInt = (max: number, min = 0): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const shuffleArray = <T>(array: Array<T>): Array<T> => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export const parseHtmlEntities = (str: string): string =>
  str.replace(/&#([0-9]{1,3});/gi, (match: string, numStr: string): string =>
    String.fromCharCode(parseInt(numStr, 10)),
  );

export const daysInMonth = (month: number, year: number): number =>
  new Date(year, month, 0).getDate();

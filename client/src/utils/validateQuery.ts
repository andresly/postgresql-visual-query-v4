import { bannedWords } from './bannedWords';

export const validateSql = (sqlString: string) => {
  const lowerCaseSql = sqlString.toLowerCase().split(' ');
  const invalidKeywords = bannedWords.filter((keyword) => keyword !== 'select' && lowerCaseSql.includes(keyword));

  return !(invalidKeywords.length > 0);
};

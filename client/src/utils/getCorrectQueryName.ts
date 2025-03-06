import { translations } from './translations';
import { LanguageType } from '../types/settingsType';

export const getCorrectQueryName = (language: LanguageType, queryName: string, queryId: number) => {
  if (queryName) {
    return queryName;
  }

  return queryId === 0
    ? translations[language.code].queryBuilder.mainQuery
    : `${translations[language.code].queryBuilder.query} ${queryId}`;
};

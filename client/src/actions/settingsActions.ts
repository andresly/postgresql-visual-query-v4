import { ChangeLanguageAction } from '../types/actions/settingsActionTypes';

export const CHANGE_LANGUAGE = 'CHANGE_LANGUAGE';

export const changeLanguage = (data: ChangeLanguageAction['payload']) => ({ type: CHANGE_LANGUAGE, payload: data });

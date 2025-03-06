import { CHANGE_LANGUAGE } from '../../actions/settingsActions';
import { SettingsType } from '../settingsType';

export interface ChangeLanguageAction {
  type: typeof CHANGE_LANGUAGE;
  payload: SettingsType['language'];
}

export type SettingActions = ChangeLanguageAction;

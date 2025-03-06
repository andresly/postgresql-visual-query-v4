import { CHANGE_LANGUAGE } from '../actions/settingsActions';
import { SettingsType } from '../types/settingsType';
import { Reducer } from 'redux';
import { SettingActions } from '../types/actions/settingsActionTypes';

export const DEFAULT_STATE: SettingsType = {
  language: { code: 'eng', name: 'English' },
};

export const settingsReducer: Reducer<SettingsType, SettingActions> = (
  state = DEFAULT_STATE,
  action: SettingActions,
) => {
  switch (action.type) {
    case CHANGE_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };
    default:
      return state;
  }
};

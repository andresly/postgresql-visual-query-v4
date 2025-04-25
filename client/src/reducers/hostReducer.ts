import { Reducer } from 'redux';
import {
  UPDATE_HOST,
  DELETE_HOST,
  CONNECT_ERROR,
  CONNECTING,
  CONNECTED,
  LOGGED_IN,
  LOGGED_OUT,
  DISCONNECT_FROM_DATABASE,
  PSQL_VERSION,
  PSQL_RESERVED_KEYWORDS,
} from '../actions/hostActions';
import { HostType } from '../types/hostTypes';
import { HostActions } from '../types/actions/hostActionTypes';

export const INITIAL_STATE: HostType = {
  database: '',
  user: '',
  password: '',
  error: '',
  loggedIn: false,
  connected: false,
  connecting: false,
  psqlVersion: '',
  reservedKeywords: [],
};

export const hostReducer: Reducer<HostType, HostActions> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_HOST: {
      return {
        ...state,
        user: action.payload.user,
        password: action.payload.password,
        database: action.payload.database,
      };
    }
    case DELETE_HOST: {
      return {
        ...INITIAL_STATE,
      };
    }
    case DISCONNECT_FROM_DATABASE: {
      return {
        ...state,
        database: '',
        connected: false,
      };
    }
    case CONNECT_ERROR: {
      return {
        ...state,
        error: action.payload,
        connecting: false,
      };
    }
    case CONNECTED: {
      return {
        ...state,
        connected: true,
        connecting: false,
      };
    }
    case LOGGED_IN: {
      return {
        ...state,
        loggedIn: true,
      };
    }
    case LOGGED_OUT: {
      return {
        ...state,
        loggedIn: false,
      };
    }
    case CONNECTING: {
      return {
        ...state,
        connecting: true,
      };
    }
    case PSQL_VERSION: {
      return {
        ...state,
        psqlVersion: action.payload,
      };
    }
    case PSQL_RESERVED_KEYWORDS: {
      return {
        ...state,
        reservedKeywords: action.payload,
      };
    }
    default:
      return state;
  }
};

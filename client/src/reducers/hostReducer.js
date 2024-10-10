import {
  UPDATE_HOST,
  DELETE_HOST,
  CONNECT_ERROR,
  CONNECTING,
  CONNECTED,
  LOGGED_IN,
  LOGGED_OUT,
  DISCONNECT_FROM_DATABASE,
} from '../actions/hostActions';

export const INITIAL_STATE = {
  database: '',
  user: '',
  password: '',
  error: '',
  loggedIn: false,
  connected: false,
  connecting: false,
};

export const hostReducer = (state = INITIAL_STATE, action = {}) => {
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
    default:
      return state;
  }
};

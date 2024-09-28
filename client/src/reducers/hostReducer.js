import { UPDATE_HOST, DELETE_HOST, CONNECT_ERROR, CONNECTING, CONNECTED } from '../actions/hostActions';

export const INITIAL_STATE = {
  database: '',
  error: '',
  connected: false,
  connecting: false,
};

export const hostReducer = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case UPDATE_HOST: {
      return {
        ...state,
        database: action.payload.database,
      };
    }
    case DELETE_HOST: {
      return {
        ...INITIAL_STATE,
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

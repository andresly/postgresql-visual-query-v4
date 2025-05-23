import { combineReducers } from 'redux';
import { hostReducer } from './hostReducer';
import { databaseReducer } from './databaseReducer';
import { queryReducer } from './queryReducer';
import { settingsReducer } from './settingsReducer';
import { queriesReducer } from './queriesReducer';
import { tableViewReducer } from './tableViewReducer';

export default combineReducers({
  host: hostReducer,
  database: databaseReducer,
  query: queryReducer,
  queries: queriesReducer,
  settings: settingsReducer,
  tableView: tableViewReducer,
});

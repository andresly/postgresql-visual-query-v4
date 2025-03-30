import { OPEN_TABLE_VIEW, CLOSE_TABLE_VIEW, SET_ACTIVE_TABLE_VIEW } from '../../actions/tableViewActions';
import { QueryTableType } from '../queryTypes';

export interface OpenTableViewAction {
  type: typeof OPEN_TABLE_VIEW;
  payload: QueryTableType;
}

export interface CloseTableViewAction {
  type: typeof CLOSE_TABLE_VIEW;
  payload: {
    id: number;
  };
}

export interface SetActiveTableViewAction {
  type: typeof SET_ACTIVE_TABLE_VIEW;
  payload: {
    id: number | null;
  };
}

export type TableViewActions = OpenTableViewAction | CloseTableViewAction | SetActiveTableViewAction;

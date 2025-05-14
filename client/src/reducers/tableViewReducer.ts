import {
  OPEN_TABLE_VIEW,
  CLOSE_TABLE_VIEW,
  SET_ACTIVE_TABLE_VIEW,
  FETCH_TABLE_DATA,
  FETCH_TABLE_DATA_FULFILLED,
  FETCH_TABLE_DATA_REJECTED,
  FETCH_TABLE_COUNT,
  FETCH_TABLE_COUNT_FULFILLED,
  FETCH_TABLE_COUNT_REJECTED,
  CLOSE_ALL_TABLE_VIEWS,
} from '../actions/tableViewActions';
import { QueryTableType } from '../types/queryTypes';
import { Reducer } from 'redux';

export interface TableViewState {
  isTableView: boolean;
  tables: QueryTableType[];
  activeTableId: number | null;
  tableData: any;
  loading: boolean;
  error: any;
  lastTabId: number;
  rowCount: number | null;
  countLoading: boolean;
  countError: any;
}

const INITIAL_STATE: TableViewState = {
  isTableView: true,
  tables: [],
  activeTableId: null,
  tableData: null,
  loading: false,
  error: null,
  lastTabId: 0,
  rowCount: null,
  countLoading: false,
  countError: null,
};

export const tableViewReducer: Reducer<TableViewState, any> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case OPEN_TABLE_VIEW: {
      // Check if the table is already open
      const existingTable = state.tables.find(
        (table) => table.table_name === action.payload.table_name && table.table_schema === action.payload.table_schema,
      );

      if (existingTable) {
        // If it exists, just make it active
        return {
          ...state,
          activeTableId: existingTable.id,
        };
      }

      // Otherwise, add it to the list with a new ID
      const newId = state.lastTabId + 1;
      const tableWithId = { ...action.payload, id: newId };

      return {
        ...state,
        tables: [...state.tables, tableWithId],
        activeTableId: newId,
        lastTabId: newId,
        tableData: null, // Reset data when opening a new table
        rowCount: null,
      };
    }

    case CLOSE_TABLE_VIEW: {
      const filteredTables = state.tables.filter((table) => table.id !== action.payload.id);

      // If closing the active tab, set active to the first available or null
      let newActiveTableId = state.activeTableId;
      if (newActiveTableId === action.payload.id) {
        newActiveTableId = filteredTables.length > 0 ? filteredTables[0].id : null;
      }

      return {
        ...state,
        tables: filteredTables,
        activeTableId: newActiveTableId,
        // Reset data if we closed the active table
        ...(state.activeTableId === action.payload.id ? { tableData: null, rowCount: null } : {}),
      };
    }

    case SET_ACTIVE_TABLE_VIEW:
      return {
        ...state,
        activeTableId: action.payload.id,
        // Reset error state when changing tables
        error: null,
      };

    case FETCH_TABLE_DATA:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_TABLE_DATA_FULFILLED:
      return {
        ...state,
        tableData: action.payload,
        loading: false,
      };

    case FETCH_TABLE_DATA_REJECTED:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case FETCH_TABLE_COUNT:
      return {
        ...state,
        countLoading: true,
        countError: null,
      };

    case FETCH_TABLE_COUNT_FULFILLED:
      return {
        ...state,
        rowCount: action.payload,
        countLoading: false,
      };

    case FETCH_TABLE_COUNT_REJECTED:
      return {
        ...state,
        countError: action.payload,
        countLoading: false,
      };

    case CLOSE_ALL_TABLE_VIEWS:
      return {
        ...state,
        tables: [],
        activeTableId: null,
        tableData: null,
        rowCount: null,
        countLoading: false,
        countError: null,
      };

    default:
      return state;
  }
};

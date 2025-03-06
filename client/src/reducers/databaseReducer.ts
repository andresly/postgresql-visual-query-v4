import { DatabaseTableType, DatabaseType } from '../types/databaseTypes';
import {
  ADD_TABLES,
  ADD_COLUMNS,
  ADD_CONSTRAINTS,
  CHANGE_SELECTED_SCHEMA,
  UPDATE_SEARCH_EXPR,
  DELETE_DATABASE,
  ADD_DATABASES,
} from '../actions/databaseActions';
import { Reducer } from '@reduxjs/toolkit';
import { DatabaseActions } from '../types/actions/databaseActionTypes';

export const INITIAL_STATE: DatabaseType = {
  schemas: [],
  tables: [],
  columns: [],
  selectedSchema: '',
  constraints: [],
  searchExpr: '',
};

export const databaseReducer: Reducer<DatabaseType, DatabaseActions> = (
  state: DatabaseType = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case ADD_DATABASES: {
      return {
        ...state,
        availableDatabases: action.payload,
      };
    }
    case ADD_TABLES: {
      const schemas: string[] = [];

      action.payload.forEach((table: DatabaseTableType) => {
        if (!schemas.includes(table.table_schema)) {
          schemas.push(table.table_schema);
        }
      });

      let selectedSchema = schemas[0];

      if (schemas.includes('public')) {
        const index = schemas.findIndex((schema) => schema === 'public');
        selectedSchema = schemas[index];
      }

      return {
        ...state,
        schemas,
        tables: action.payload,
        selectedSchema,
      };
    }
    case CHANGE_SELECTED_SCHEMA: {
      return {
        ...state,
        selectedSchema: action.payload,
      };
    }
    case ADD_COLUMNS: {
      return {
        ...state,
        columns: action.payload,
      };
    }
    case ADD_CONSTRAINTS: {
      return {
        ...state,
        constraints: action.payload,
      };
    }
    case UPDATE_SEARCH_EXPR: {
      return {
        ...state,
        searchExpr: action.payload,
      };
    }
    case DELETE_DATABASE: {
      return INITIAL_STATE;
    }
    default:
      return state;
  }
};

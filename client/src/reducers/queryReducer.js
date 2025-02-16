import _ from 'lodash';
import randomColor from 'randomcolor';
import { ActionType } from 'redux-promise-middleware';
import {
  ADD_COLUMN,
  ADD_JOIN,
  ADD_RESULT,
  ADD_SET,
  ADD_TABLE,
  CHANGE_QUERY_TYPE,
  DELETE_QUERY,
  RESET_QUERY,
  GENERATE_SQL,
  QUERYING,
  REMOVE_COLUMN,
  REMOVE_JOIN,
  REMOVE_SET,
  REMOVE_TABLE,
  SET_ACTIVE_QUERY,
  SET_LIMIT_VALUE,
  SWITCH_DISTINCT,
  SWITCH_RETURNING,
  SWITCH_FROM_QUERY,
  UPDATE_FROM_QUERY,
  SWITCH_LIMIT,
  SWITCH_TIES,
  UPDATE_COLUMN,
  UPDATE_COLUMN_OPERAND,
  UPDATE_COLUMNS_ORDER,
  UPDATE_JOIN,
  UPDATE_JOIN_NEW_TABLE,
  UPDATE_JOINS_ORDER,
  UPDATE_SET,
  UPDATE_SETS_ORDER,
  UPDATE_SQL,
  UPDATE_TABLE,
  UPDATE_VALIDITY,
  ADD_ROWS,
  REMOVE_ROWS,
  ADD_USING,
  UPDATE_USING,
  REMOVE_USING,
  CHANGE_DEFAULT_VALUE,
  ADD_FILTER_ROW,
  REMOVE_FILTER_ROW,
  UPDATE_COLUMN_FILTER,
} from '../actions/queryActions';
import { buildQuery, buildDeleteQuery, buildInsertQuery, buildUpdateQuery } from '../utils/queryBuilder';

export const INITIAL_STATE = {
  id: 0,
  columns: [],
  queryType: 'SELECT',
  tables: [],
  distinct: false,
  returning: false,
  limit: false,
  limitValue: 50,
  withTies: false,
  sql: '',
  result: null,
  joins: [],
  using: [],
  error: null,
  lastColumnId: 0,
  lastTableId: 0,
  querying: false,
  queryName: '',
  queryValid: true,
  sets: [],
  rows: 1,
  filterRows: 1,
  fromQuery: false,
  subqueryId: 0,
  subquerySql: '',
  defaultValue: 'DEFAULT',
};

export const queryReducer = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case SET_ACTIVE_QUERY: {
      const activeQuery = _.cloneDeep(action.payload);
      const { queryName } = activeQuery;

      return {
        ...state,
        ...activeQuery,
        queryName,
      };
    }
    case ADD_COLUMN: {
      const column = _.cloneDeep(action.payload);

      column.column_name = action.payload.column_name;
      column.column_name_original = action.payload.column_name;
      column.id = state.lastColumnId + 1;

      // Find existing columns with the same name
      const existingColumns = state.columns.filter(
        (stateColumn) => stateColumn.column_name === action.payload.column_name,
      );

      console.log('state.columns', state.columns);
      console.log('existingColumns', existingColumns);
      // Set alias if there are existing columns with the same name
      // remove double quotes from column_alias
      if (existingColumns.length > 0) {
        column.column_alias = `${column.column_name}_${existingColumns.length + 1}`;
      } else {
        column.column_alias = '';
      }

      column.column_name = action.payload.column_name;
      column.column_name_original = action.payload.column_name;
      column.id = state.lastColumnId + 1;
      column.column_filter = '';
      column.column_conditions = ['', ''];
      column.column_filters = Array.from({ length: state.filterRows }, (_, index) => ({ id: index, filter: '' }));
      column.column_aggregate = '';
      column.column_single_line_function = '';
      column.column_distinct_on = false;
      column.column_sort_order = 0;
      column.column_order_dir = true;
      column.column_order_nr = null;
      column.column_group_by = false;
      column.display_in_query = true;
      column.column_filter_operand = '';
      column.filter_as_having = false;
      column.subquerySql = '';
      column.subqueryId = 0;
      column.returning = false;
      column.returningOnly = false;
      column.column_values = Array.from(
        {
          length: state.rows,
        },
        (_, index) => ({ id: index, value: state.defaultValue }),
      );
      column.column_value = 'NULL';
      column.value_enabled = true;

      const copies = state.columns.filter(
        (stateColumn) =>
          _.isEqual(stateColumn.table_name, column.table_name) &&
          _.isEqual(stateColumn.table_schema, column.table_schema) &&
          _.isEqual(stateColumn.column_name, column.column_name),
      );

      let largestCopy = 0;

      copies.forEach((copy) => {
        if (_.includes(copy.column_alias, `${column.column_name}_`, 0)) {
          const numb = copy.column_alias.replace(/[^0-9]/g, '');

          if (parseInt(numb, 10) > largestCopy) {
            largestCopy = parseInt(numb, 10);
          }
        }
      });

      if (copies.length > 0 && largestCopy === 0) {
        column.column_alias = `${column.column_name}_1`;
      }

      if (largestCopy > 0) {
        const index = largestCopy + 1;

        column.column_alias = `${column.column_name}_${index}`;
      }
      return {
        ...state,
        columns: [...state.columns, column],
        lastColumnId: column.id,
      };
    }
    case CHANGE_QUERY_TYPE: {
      return {
        ...state,
        queryType: action.payload,
      };
    }
    case CHANGE_DEFAULT_VALUE: {
      return {
        ...state,
        defaultValue: state.defaultValue === 'DEFAULT' ? 'NULL' : 'DEFAULT',
      };
    }
    case ADD_ROWS: {
      const columns = _.cloneDeep(state.columns);
      columns.forEach((column) => {
        column.column_values.push({ id: state.rows, value: state.defaultValue });
      });

      return {
        ...state,
        columns,
        rows: state.rows + 1,
      };
    }
    case REMOVE_ROWS: {
      if (state.rows > 1) {
        const columns = _.cloneDeep(state.columns);
        columns.forEach((column) => {
          column.column_values.splice(-1);
        });

        return {
          ...state,
          columns,
          rows: state.rows - 1,
        };
      }
      return {
        ...state,
      };
    }
    case ADD_FILTER_ROW: {
      const columns = _.cloneDeep(state.columns);
      columns.forEach((column) => {
        column.column_filters.push({ id: state.filterRows, filter: '' });
      });

      return {
        ...state,
        columns,
        filterRows: state.filterRows + 1,
      };
    }
    case REMOVE_FILTER_ROW: {
      if (state.filterRows > 1) {
        const columns = _.cloneDeep(state.columns);
        columns.forEach((column) => {
          column.column_filters.splice(-1);
        });

        return {
          ...state,
          columns,
          filterRows: state.filterRows - 1,
        };
      }

      return {
        ...state,
      };
    }
    case UPDATE_COLUMN_FILTER: {
      const columns = _.cloneDeep(state.columns);
      const columnIndex = state.columns.findIndex((column) => -_.isEqual(column.id, action.payload.columnId));
      const filters = state.columns[columnIndex].column_filters;

      filters[action.payload.filterId].filter = action.payload.filter;

      columns[columnIndex].column_filters = filters;

      return {
        ...state,
        columns,
      };
    }
    case UPDATE_FROM_QUERY: {
      const subQuery = action.payload;

      return {
        ...state,
        subqueryId: subQuery.subqueryId,
        subquerySql: subQuery.subquerySql,
      };
    }
    case UPDATE_COLUMN: {
      const columns = _.cloneDeep(state.columns);
      const updatedColumn = action.payload;
      const columnIndex = state.columns.findIndex((column) => _.isEqual(column.id, updatedColumn.id));

      if (columnIndex > -1) {
        columns[columnIndex] = updatedColumn;
      }

      return {
        ...state,
        columns,
      };
    }
    case UPDATE_COLUMN_OPERAND: {
      return {
        ...state,
        columns: state.columns.map((column) =>
          column.id === action.payload.id
            ? {
                ...column,
                column_filter_operand: action.payload.operand,
              }
            : column,
        ),
      };
    }
    case REMOVE_COLUMN: {
      const removableColumn = action.payload;

      const filteredColumns = state.columns.filter(
        (column) => !(_.isEqual(column.table_id, removableColumn.table_id) && _.isEqual(column.id, removableColumn.id)),
      );

      if (filteredColumns.length) {
        filteredColumns[filteredColumns.length - 1].column_filter_operand = '';
      }

      return {
        ...state,
        columns: filteredColumns,
      };
    }
    case UPDATE_COLUMNS_ORDER: {
      return {
        ...state,
        columns: action.payload,
      };
    }
    case ADD_TABLE: {
      const table = _.cloneDeep(action.payload);

      table.id = state.lastTableId + 1;
      table.table_alias = '';

      const copies = state.tables.filter(
        (stateTable) =>
          _.isEqual(stateTable.table_name, table.table_name) && _.isEqual(stateTable.table_schema, table.table_schema),
      );

      let largestCopy = 0;

      copies.forEach((copy) => {
        if (_.includes(copy.table_alias, `${table.table_name}_`, 0)) {
          const numb = copy.table_alias.replace(/[^0-9]/g, '');

          if (parseInt(numb, 10) > largestCopy) {
            largestCopy = parseInt(numb, 10);
          }
        }
      });

      if (copies.length > 0 && largestCopy === 0) {
        table.table_alias = `${table.table_name}_1`;
      }

      if (largestCopy > 0) {
        const index = largestCopy + 1;
        table.table_alias = `${table.table_name}_${index}`;
      }

      return {
        ...state,
        tables: [...state.tables, table],
        lastTableId: table.id,
      };
    }
    case REMOVE_TABLE: {
      const removableTable = action.payload;
      const filteredTables = state.tables.filter((table) => !_.isEqual(table.id, removableTable.id));
      const filteredColumns = state.columns.filter((column) => !_.isEqual(column.table_id, removableTable.id));
      const filteredJoins = state.joins.filter((join) => !_.isEqual(join.main_table.id, removableTable.id));
      const filteredUsing = state.using.filter((using) => !_.isEqual(using.main_table.id, removableTable.id));

      return {
        ...state,
        columns: filteredColumns,
        tables: filteredTables,
        joins: filteredJoins,
        using: filteredUsing,
      };
    }
    case UPDATE_TABLE: {
      const updatedTable = action.payload;
      const tableIndex = state.tables.findIndex((table) => _.isEqual(table.id, updatedTable.id));
      const tables = _.cloneDeep(state.tables);

      if (tableIndex > -1) {
        tables[tableIndex] = updatedTable;
      }

      const updatedColumns = state.columns.map((column) => {
        const col = column;

        if (_.isEqual(col.table_id, updatedTable.id)) {
          col.table_alias = updatedTable.table_alias;
        }

        return col;
      });

      const updatedJoins = state.joins.map((join) => {
        const joinCopy = join;

        if (_.isEqual(joinCopy.main_table.id, updatedTable.id)) {
          joinCopy.main_table.table_alias = updatedTable.table_alias;
        }

        join.conditions.forEach((condition) => {
          const conditionCopy = condition;

          if (_.isEqual(conditionCopy.secondary_table.id, updatedTable.id)) {
            conditionCopy.secondary_table.table_alias = updatedTable.table_alias;
          }
        });

        return join;
      });

      return {
        ...state,
        columns: updatedColumns,
        tables,
        joins: updatedJoins,
      };
    }
    case SWITCH_DISTINCT: {
      return {
        ...state,
        distinct: !state.distinct,
      };
    }
    case SWITCH_RETURNING: {
      return {
        ...state,
        returning: !state.returning,
      };
    }
    case SWITCH_FROM_QUERY: {
      return {
        ...state,
        fromQuery: !state.fromQuery,
      };
    }
    case SWITCH_LIMIT: {
      return {
        ...state,
        limit: !state.limit,
      };
    }
    case SWITCH_TIES: {
      return {
        ...state,
        withTies: !state.withTies,
      };
    }
    case SET_LIMIT_VALUE: {
      return {
        ...state,
        limitValue: action.payload.limitValue,
      };
    }
    case ADD_USING: {
      let id = 0;

      if (state.using.length > 0) {
        id = state.using[state.using.length - 1].id + 1;
      }

      const usingTable = {
        id,
        main_table: {
          table_name: '',
          table_schema: '',
          table_alias: '',
        },
        conditions: [],
      };

      return {
        ...state,
        using: [...state.using, usingTable],
      };
    }
    case UPDATE_USING: {
      const using = _.cloneDeep(state.using);

      if (action.payload.newTable) {
        const table = _.cloneDeep(action.payload.using.main_table);

        table.id = state.lastTableId + 1;
        table.table_alias = '';

        const copies = state.tables.filter(
          (stateTable) =>
            _.isEqual(stateTable.table_name, table.table_name) &&
            _.isEqual(stateTable.table_schema, table.table_schema),
        );

        let largestCopy = 0;

        copies.forEach((copy) => {
          if (_.includes(copy.table_alias, `${table.table_name}_`, 0)) {
            const numb = copy.table_alias.replace(/[^0-9]/g, '');

            if (parseInt(numb, 10) > largestCopy) {
              largestCopy = parseInt(numb, 10);
            }
          }
        });

        if (copies.length > 0 && largestCopy === 0) {
          table.table_alias = `${table.table_name}_1`;
        }

        if (largestCopy > 0) {
          const index = largestCopy + 1;
          table.table_alias = `${table.table_name}_${index}`;
        }

        if (action.payload.using.id > -1 && action.payload.using.id < state.using.length) {
          using[action.payload.using.id] = action.payload.using;
        }

        return {
          ...state,
          lastTableId: table.id,
          tables: [...state.tables, table],
          using,
        };
      }

      if (action.payload.using.id > -1 && action.payload.using.id < state.using.length) {
        using[action.payload.using.id] = action.payload.using;

        return {
          ...state,
          using,
        };
      }
    }
    case REMOVE_USING: {
      const filteredUsing = state.using.filter((using) => using.id !== action.payload.id);

      return {
        ...state,
        using: filteredUsing,
      };
    }
    case ADD_JOIN: {
      let id = 0;

      if (state.joins.length > 0) {
        id = state.joins[state.joins.length - 1].id + 1;
      }

      const join = {
        id,
        type: 'inner',
        color: randomColor({
          luminosity: 'bright',
        }),
        main_table: {
          table_name: '',
          table_schema: '',
          table_alias: '',
        },
        conditions: [],
      };

      return {
        ...state,
        joins: [...state.joins, join],
        isDragAndDrop: action.payload.isDragAndDrop,
      };
    }
    case UPDATE_JOIN: {
      const joins = _.cloneDeep(state.joins);

      if (action.payload.id > -1 && action.payload.id < state.joins.length) {
        joins[action.payload.id] = action.payload;
      }

      return {
        ...state,
        joins,
      };
    }
    case UPDATE_JOIN_NEW_TABLE: {
      const table = _.cloneDeep(action.payload.main_table);

      table.id = state.lastTableId + 1;
      table.table_alias = '';

      const copies = state.tables.filter(
        (stateTable) =>
          _.isEqual(stateTable.table_name, table.table_name) && _.isEqual(stateTable.table_schema, table.table_schema),
      );

      let largestCopy = 0;

      copies.forEach((copy) => {
        if (_.includes(copy.table_alias, `${table.table_name}_`, 0)) {
          const numb = copy.table_alias.replace(/[^0-9]/g, '');

          if (parseInt(numb, 10) > largestCopy) {
            largestCopy = parseInt(numb, 10);
          }
        }
      });

      if (copies.length > 0 && largestCopy === 0) {
        table.table_alias = `${table.table_name}_1`;
      }

      if (largestCopy > 0) {
        const index = largestCopy + 1;
        table.table_alias = `${table.table_name}_${index}`;
      }

      const joins = _.cloneDeep(state.joins);

      if (action.payload.id > -1 && action.payload.id < state.joins.length) {
        joins[action.payload.id] = action.payload;
      }

      return {
        ...state,
        tables: [...state.tables, table],
        lastTableId: table.id,
        joins,
      };
    }
    case REMOVE_JOIN: {
      const filteredJoins = state.joins
        .filter((join) => join.id !== action.payload.id)
        .map((join, index) => ({
          ...join,
          id: index,
        }));

      return {
        ...state,
        joins: filteredJoins,
      };
    }
    case `${ADD_RESULT}_${ActionType.Fulfilled}`: {
      return {
        ...state,
        result: action.payload.data,
        error: null,
        querying: false,
      };
    }
    case UPDATE_JOINS_ORDER: {
      return {
        ...state,
        joins: action.payload,
      };
    }
    case DELETE_QUERY: {
      return INITIAL_STATE;
    }
    case RESET_QUERY: {
      return {
        ...INITIAL_STATE,
        id: state.id,
        queryType: action.payload,
      };
    }
    case GENERATE_SQL: {
      if (state.queryType === 'SELECT') {
        const query = buildQuery(state);

        return {
          ...state,
          sql: query,
        };
      }
      if (state.queryType === 'DELETE') {
        const query = buildDeleteQuery(state);

        return {
          ...state,
          sql: query,
        };
      }
      if (state.queryType === 'INSERT') {
        const query = buildInsertQuery(state);

        return {
          ...state,
          sql: query,
        };
      }
      if (state.queryType === 'UPDATE') {
        const query = buildUpdateQuery(state);

        return {
          ...state,
          sql: query,
        };
      }
    }
    case UPDATE_SQL: {
      return {
        ...state,
        sql: action.payload.sqlString,
      };
    }
    case `${ADD_RESULT}_REJECTED`: {
      return {
        ...state,
        error: action.payload,
        result: null,
        querying: false,
      };
    }
    case QUERYING: {
      return {
        ...state,
        querying: true,
      };
    }
    case UPDATE_VALIDITY: {
      return {
        ...state,
        queryValid: action.payload.isValid,
      };
    }
    case ADD_SET: {
      let id = 0;

      if (state.sets.length > 0) {
        id = state.sets[state.sets.length - 1].id + 1;
      }

      const set = {
        id,
        type: 'union',
        color: randomColor({
          luminosity: 'bright',
        }),
        subquerySql: '',
        subqueryId: 0,
      };

      return {
        ...state,
        sets: [...state.sets, set],
      };
    }
    case UPDATE_SET: {
      const sets = _.cloneDeep(state.sets);

      if (action.payload.id > -1 && action.payload.id < state.sets.length) {
        sets[action.payload.id] = action.payload;
      }

      return {
        ...state,
        sets,
      };
    }
    case REMOVE_SET: {
      const filteredSets = state.sets.filter((set) => set.id !== action.payload.id);

      return {
        ...state,
        sets: filteredSets,
      };
    }
    case UPDATE_SETS_ORDER: {
      return {
        ...state,
        sets: action.payload,
      };
    }
    default:
      return state;
  }
};

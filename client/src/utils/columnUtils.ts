import { QueryColumnType } from '../types/queryTypes';

/**
 * Creates an empty QueryColumnType with default values
 * Use this as a base template when creating new columns
 *
 * @param overrides - Optional properties to override default values
 * @returns A new QueryColumnType object with default values
 */
export const createEmptyColumn = (overrides: Partial<QueryColumnType> = {}): QueryColumnType => {
  const defaultColumn: QueryColumnType = {
    id: Math.floor(Math.random() * 1000000),
    column_name: '',
    column_name_original: '',
    column_alias: '',
    column_filter: '',
    column_filter_operand: '',
    column_conditions: ['', ''],
    column_filters: [{ id: 0, filter: '' }],
    column_values: [{ id: 0, value: 'DEFAULT' }],
    column_value: 'NULL',
    column_aggregate: '',
    column_single_line_function: '',
    column_distinct_on: false,
    column_sort_order: 'desc',
    column_order_dir: true,
    column_order_nr: null,
    column_nulls_position: '',
    column_group_by: false,
    column_order: false,
    display_in_query: true,
    filter_as_having: false,
    ordinal_position: 0,
    data_type: '',
    constraints: [],
    table_name: '',
    table_schema: '',
    table_alias: '',
    table_id: 0,
    subquerySql: '',
    subqueryId: 0,
    returning: false,
    returningOnly: false,
    value_enabled: true,
  };

  return { ...defaultColumn, ...overrides };
};

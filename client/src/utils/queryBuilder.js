import * as _ from 'lodash';
import * as format from 'pg-format';
import * as squel from 'squel';

const squelPostgres = squel.useFlavour('postgres');

const addColumnsToQuery = (data, query) => {
  const columns = _.cloneDeep(data.columns);

  const addOrder = (column) => {
    if (_.isEmpty(column.table_alias)) {
      query.order(`${format.ident(column.table_name)}.${format.ident(column.column_name)}`, column.column_order_dir);
    } else {
      query.order(`${format.ident(column.table_alias)}.${format.ident(column.column_name)}`, column.column_order_dir);
    }
  };

  const addField = (table, column) => {
    query.field(`${format.ident(table)}.${format.ident(column)}`);
  };

  const addFieldWithAlias = (table, column, alias) => {
    query.field(`${format.ident(table)}.${format.ident(column)}`, `${format.ident(alias)}`);
  };

  const addGroupBy = (table, column) => {
    query.group(`${format.ident(table)}.${format.ident(column)}`);
  };

  // Function to process individual conditions
  const processCondition = (columnName, condition) => {
    // Replace double quotes with single quotes
    const filterValue = condition.replace(/"/g, "'").trim();
    return `${columnName} ${filterValue}`;
  };

  // Build filters by combining conditions at the same index across columns
  const buildFilters = (columns) => {
    const maxConditionsLength = Math.max(...columns.map((column) => column.column_conditions.length));
    const whereClauses = [];
    const havingClauses = [];

    Array.from({ length: maxConditionsLength }).forEach((_, i) => {
      const whereConditionsAtIndex = [];
      const havingConditionsAtIndex = [];

      columns.forEach((column) => {
        const condition = column.column_conditions[i];

        if (condition && condition.trim() !== '') {
          let columnName = `${format.ident(column.table_name)}.${format.ident(column.column_name)}`;
          if (!_.isEmpty(column.table_alias)) {
            columnName = `${format.ident(column.table_alias)}.${format.ident(column.column_name)}`;
          }

          if (column.column_aggregate && column.column_aggregate.length > 0) {
            const aggregatedColumn = `${column.column_aggregate}(${columnName})`;
            havingConditionsAtIndex.push(processCondition(aggregatedColumn, condition));
          } else {
            whereConditionsAtIndex.push(processCondition(columnName, condition));
          }
        }
      });

      if (whereConditionsAtIndex.length > 0) {
        whereClauses.push(`(${whereConditionsAtIndex.join(' AND ')})`);
      }
      if (havingConditionsAtIndex.length > 0) {
        havingClauses.push(`(${havingConditionsAtIndex.join(' AND ')})`);
      }
    });

    return {
      where: whereClauses.join(' OR '),
      having: havingClauses.join(' OR '),
    };
  };

  // Check if any column uses aggregation
  const hasAggregates = columns.some((col) => col.column_aggregate && col.column_aggregate.length > 0);

  // Process columns for fields, orders, group by, etc.
  columns.forEach((column) => {
    if (!data.distinct && column.column_distinct_on) {
      query.distinct(`${format.ident(column.table_name)}.${format.ident(column.column_name)}`);
    }

    if (column.display_in_query) {
      // Generate automatic alias for aggregated or single line function columns if no alias is specified
      const hasInlineAlias = column.column_name.toUpperCase().includes(' AS ');
      const autoAlias = hasInlineAlias ? '' : column.column_alias;

      if (autoAlias.length === 0) {
        if (column.table_alias.length === 0) {
          let field = column.column_name;

          // Only add table prefix if column_name matches the original
          if (column.column_name === column.column_name_original) {
            field = `${column.table_name}.${field}`;
          }

          if (column.column_aggregate.length > 0) {
            field = `${column.column_aggregate}(${field})`;
            query.field(field);
          } else if (column.column_single_line_function.length > 0) {
            field = `${column.column_single_line_function}(${field})`;
            query.field(field);
          } else {
            // If column name is modified, use it directly without table prefix
            if (column.column_name === column.column_name_original) {
              addField(column.table_name, column.column_name);
            } else {
              query.field(column.column_name);
            }
          }
        } else {
          let field = column.column_name;

          // Only add table alias prefix if column_name matches the original
          if (column.column_name === column.column_name_original) {
            field = `${column.table_alias}.${field}`;
          }

          if (column.column_aggregate.length > 0) {
            field = `${column.column_aggregate}(${field})`;
            query.field(field);
          } else if (column.column_single_line_function.length > 0) {
            field = `${column.column_single_line_function}(${field})`;
            query.field(field);
          } else {
            // If column name is modified, use it directly without table prefix
            if (column.column_name === column.column_name_original) {
              addField(column.table_alias, column.column_name);
            } else {
              query.field(column.column_name);
            }
          }
        }
      } else if (column.table_alias.length === 0) {
        let field = column.column_name;

        // Only add table prefix if column_name matches the original
        if (column.column_name === column.column_name_original) {
          field = `${column.table_name}.${field}`;
        }

        if (column.column_aggregate.length > 0) {
          field = `${column.column_aggregate}(${field})`;
          query.field(field, autoAlias);
        } else if (column.column_single_line_function.length > 0) {
          field = `${column.column_single_line_function}(${field})`;
          query.field(field, autoAlias);
        } else {
          if (column.column_name === column.column_name_original) {
            addFieldWithAlias(column.table_name, column.column_name, autoAlias);
          } else {
            query.field(column.column_name, autoAlias);
          }
        }
      } else {
        let field = column.column_name;

        // Only add table alias prefix if column_name matches the original
        if (column.column_name === column.column_name_original) {
          field = `${column.table_alias}.${field}`;
        }

        if (column.column_aggregate.length > 0) {
          field = `${column.column_aggregate}(${field})`;
          query.field(field, autoAlias);
        } else if (column.column_single_line_function.length > 0) {
          field = `${column.column_single_line_function}(${field})`;
          query.field(field, autoAlias);
        } else {
          if (column.column_name === column.column_name_original) {
            addFieldWithAlias(column.table_alias, column.column_name, autoAlias);
          } else {
            query.field(column.column_name, autoAlias);
          }
        }
      }
    }

    if (!column.display_in_query && column.column_aggregate) {
      if (!column.column_alias) {
        query.field(`${column.column_aggregate}(*)`);
      } else {
        query.field(`${column.column_aggregate}(*) AS ${format.ident(column.column_alias)}`);
      }
    }

    // If we have aggregates, automatically add group by for non-aggregated displayed columns
    if (
      hasAggregates &&
      column.display_in_query &&
      (!column.column_aggregate || column.column_aggregate.length === 0)
    ) {
      if (_.isEmpty(column.table_alias)) {
        addGroupBy(column.table_name, column.column_name);
      } else {
        addGroupBy(column.table_alias, column.column_name);
      }
    }
  });

  // Handle ordering separately, sorted by column_sort_order
  columns
    .filter((column) => column.column_order)
    .sort((a, b) => {
      const aOrder = parseInt(a.column_sort_order, 10) || Number.MAX_SAFE_INTEGER;
      const bOrder = parseInt(b.column_sort_order, 10) || Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    })
    .forEach((column) => {
      if (column.column_aggregate && column.column_aggregate.length > 0) {
        const autoAlias =
          column.column_alias.length > 0
            ? column.column_alias
            : `${column.column_aggregate.toLowerCase()}_${column.column_name}`.toLowerCase();
        query.order(format.ident(autoAlias), column.column_order_dir);
      } else if (column.column_single_line_function && column.column_single_line_function.length > 0) {
        // Handle single line function in ORDER BY
        if (column.column_alias.length > 0) {
          query.order(format.ident(column.column_alias), column.column_order_dir);
        } else {
          const tableName = _.isEmpty(column.table_alias) ? column.table_name : column.table_alias;
          const field = `${column.column_single_line_function}(${format.ident(tableName)}.${format.ident(column.column_name)})`;
          query.order(field, column.column_order_dir);
        }
      } else if (_.isEmpty(column.column_alias)) {
        addOrder(column);
      } else {
        query.order(`${format.ident(column.column_alias)}`, column.column_order_dir);
      }
    });

  // Build and apply the WHERE and HAVING clauses
  const { where, having } = buildFilters(columns);
  if (where) {
    query.where(where);
  }
  if (having) {
    query.having(having);
  }
};

const buildJoinOn = (join) => {
  let mainTable = join.conditions[0].main_table.table_name;
  if (!_.isEmpty(join.conditions[0].main_table.table_alias)) {
    mainTable = join.conditions[0].main_table.table_alias;
  }

  const conditionArray = [];
  const conditions = _.cloneDeep(join.conditions);

  conditions.forEach((condition) => {
    if (
      !_.isEmpty(condition.main_column) &&
      !_.isEmpty(condition.secondary_column) &&
      !_.isEmpty(condition.secondary_table.table_name)
    ) {
      let secondaryTable = condition.secondary_table.table_name;
      if (!_.isEmpty(condition.secondary_table.table_alias)) {
        secondaryTable = condition.secondary_table.table_alias;
      }

      const conditionString = `${format.ident(mainTable)}.${format.ident(condition.main_column)} = ${format.ident(secondaryTable)}.${format.ident(condition.secondary_column)}`;
      conditionArray.push(conditionString);
    }
  });
  return conditionArray.join(' AND ');
};

const addJoinsToQuery = (data, query) => {
  const joins = _.cloneDeep(data.joins);

  const addJoin = (joinObj, on, joinFn) => {
    const tableName = `${format.ident(joinObj.conditions[0].secondary_table.table_schema)}.${format.ident(joinObj.conditions[0].secondary_table.table_name)}`;
    const tableAlias = joinObj.conditions[0].secondary_table.table_alias;

    if (!_.isEmpty(tableAlias)) {
      joinFn(tableName, format.ident(tableAlias), on);
    } else {
      joinFn(tableName, null, on);
    }
  };

  joins.forEach((joinObj) => {
    const on = buildJoinOn(joinObj);

    if (!_.isEmpty(joinObj.conditions[0].secondary_table.table_name) && !_.isEmpty(on)) {
      switch (joinObj.type) {
        case 'inner': {
          addJoin(joinObj, on, query.join);
          break;
        }
        case 'right': {
          addJoin(joinObj, on, query.right_join);
          break;
        }
        case 'left': {
          addJoin(joinObj, on, query.left_join);
          break;
        }
        case 'outer': {
          addJoin(joinObj, on, query.outer_join);
          break;
        }
        case 'cross': {
          addJoin(joinObj, on, query.cross_join);
          break;
        }
        default:
          break;
      }
    }
  });
};

const buildSetQuery = (data) => {
  const sets = _.cloneDeep(data.sets);

  let setQuery = '';

  sets.forEach((set) => {
    const cleanSubquerySql = set.subquerySql.slice(0, -1);

    if (set.subquerySql.length) {
      switch (set.type) {
        case 'union': {
          setQuery += `\nUNION\n${cleanSubquerySql}`;
          break;
        }
        case 'unionall': {
          setQuery += `\nUNION ALL\n${cleanSubquerySql}`;
          break;
        }
        case 'intersect': {
          setQuery += `\nINTERSECT\n${cleanSubquerySql}`;
          break;
        }
        case 'except': {
          setQuery += `\nEXCEPT\n${cleanSubquerySql}`;
          break;
        }
        default:
          break;
      }
    }
  });

  return setQuery;
};

const addTablesToQuery = (data, query) => {
  const addTable = (table) => {
    if (_.isEmpty(table.table_alias)) {
      query.from(`${format.ident(table.table_schema)}.${format.ident(table.table_name)}`);
    } else {
      query.from(
        `${format.ident(table.table_schema)}.${format.ident(table.table_name)}`,
        `${format.ident(table.table_alias)}`,
      );
    }
  };

  if (data.tables.length > 0) {
    const tables = _.cloneDeep(data.tables);

    if (_.isEmpty(data.joins)) {
      tables.forEach((table) => {
        addTable(table);
      });
    } else {
      addTable(tables[0]);
      addJoinsToQuery(data, query);
      buildSetQuery(data, query);
    }
  }
};

export const buildQuery = (data) => {
  const query = squelPostgres.select({
    useAsForTableAliasNames: true,
    fieldAliasQuoteCharacter: '',
    tableAliasQuoteCharacter: '',
    nameQuoteCharacter: '"',
    separator: '\n',
  });

  if (data.distinct) {
    query.distinct();
  }

  addColumnsToQuery(data, query);
  addTablesToQuery(data, query);

  const setQueryString = buildSetQuery(data);

  if (data.limit && data.limitValue) {
    return `${`${query.toString() + setQueryString}\n` + `FETCH FIRST ${data.limitValue} ROWS ${data.withTies ? 'WITH TIES;' : 'ONLY;'}`}`;
  }

  return `${query}${setQueryString};`;
};

const addFilterToQueryNew = (data) => {
  const columns = _.cloneDeep(data.columns);

  let whereQuery = '';
  const filterList = [];
  let filterLength;

  if (columns[0]) {
    filterLength = columns[0].column_filters.length;
  }

  columns.forEach((column) => {
    column.column_filters.forEach((filter) => {
      if (filter.filter.length > 0 && !column.returningOnly) {
        filterList.push({ id: filter.id, filter: `${column.table_name}.${column.column_name} ${filter.filter}` });
      }
    });
  });

  const finalFilter = [];

  for (let i = 0; i < filterLength + 1; i += 1) {
    const filterRow = [];
    filterList.forEach((filterCell) => {
      if (filterCell.id === i) {
        filterRow.push(filterCell.filter);
      }
    });
    if (filterRow.length > 0) {
      finalFilter.push(`(${filterRow.join(' AND ')})`);
    }
  }
  whereQuery += finalFilter.join(' OR ');

  if (whereQuery.length > 0) {
    return `(${whereQuery})`;
  }

  return whereQuery;
};

const getUsingTables = (data) => {
  const usings = _.cloneDeep(data.using);

  const usingTables = [];

  usings.forEach((using) => {
    usingTables.push(`${using.main_table.table_schema}.${using.main_table.table_name}`);
  });

  return usingTables;
};

const getUsingConditions = (data) => {
  const usings = _.cloneDeep(data.using);

  const usingConditions = [];

  usings.forEach((using) => {
    using.conditions.forEach((condition) => {
      usingConditions.push(
        `${condition.secondary_table.table_name}.${condition.secondary_column} = ${using.main_table.table_name}.${condition.main_column}`,
      );
    });
  });

  return usingConditions;
};

const addReturningToQuery = (data) => {
  const columns = _.cloneDeep(data.columns);

  let returning = '';
  const returningColumns = [];

  columns.forEach((column) => {
    if (column.returning || column.returningOnly) {
      returningColumns.push(`${column.table_name}.${column.column_name}`);
    }
  });

  returning += returningColumns.join(', ');

  if (data.returning) {
    return '*';
  }
  return returning;
};

const addInsertValuesToQuery = (data, query) => {
  const columns = _.cloneDeep(data.columns);
  const valuesList = [];

  for (let i = 0; i < data.rows; i += 1) {
    const valueRow = {};

    columns.forEach((column) => {
      if (!column.returningOnly) {
        if (column.column_values[i].value === '') {
          valueRow[column.column_name] = 'NULL';
        } else {
          valueRow[column.column_name] = column.column_values[i].value;
        }
      }
    });

    query.setFields(valueRow, { dontQuote: true });
    valuesList.push(query.toString().split('\n').slice(-1).toString().split('VALUES').slice(-1));
  }
  return valuesList;
};

const addUpdateValuesToQuery = (data, query) => {
  const columns = _.cloneDeep(data.columns);

  columns.forEach((column) => {
    if (!column.returningOnly && column.table_id === data.tables[0].id && column.value_enabled) {
      query.set(column.column_name, column.column_value, { dontQuote: true });
    }
  });
};

export const buildDeleteQuery = (data) => {
  const query = squelPostgres.delete({
    useAsForTableAliasNames: true,
    fieldAliasQuoteCharacter: '',
    tableAliasQuoteCharacter: '',
    nameQuoteCharacter: '"',
    separator: '\n',
  });

  query.from(`${format.ident(data.tables[0].table_schema)}.${format.ident(data.tables[0].table_name)}`);

  const usingTables = getUsingTables(data, query);
  const usingConditions = getUsingConditions(data, query);

  return `${`${
    query.toString() +
    (usingTables.length > 0
      ? `\nUSING ${usingTables.join(', ')}\n` +
        'WHERE ' +
        `(${usingConditions.join(' AND ')})` +
        (addFilterToQueryNew(data).length > 0 ? ` AND ${addFilterToQueryNew(data, query)}` : '')
      : addFilterToQueryNew(data, query).length > 0
        ? `\nWHERE ${addFilterToQueryNew(data, query)}`
        : '')
  }\n${addReturningToQuery(data, query).length > 0 ? `RETURNING ${addReturningToQuery(data, query)}` : ''}`};`;
};

export const buildInsertQuery = (data) => {
  const query = squelPostgres.insert({
    useAsForTableAliasNames: true,
    fieldAliasQuoteCharacter: '',
    tableAliasQuoteCharacter: '',
    nameQuoteCharacter: '"',
    separator: '\n',
  });

  query.into(`${format.ident(data.tables[0].table_schema)}.${format.ident(data.tables[0].table_name)}`);

  const columnString = [];
  data.columns.forEach((column) => {
    if (!column.returningOnly) {
      columnString.push(column.column_name);
    }
  });

  if (data.fromQuery) {
    return `${`${query.toString()} ${columnString.length > 0 ? `(${columnString.join(', ')})` : ''}` + `\n${data.subquerySql.slice(0, -1)}\n${addReturningToQuery(data, query).length > 0 ? `RETURNING ${addReturningToQuery(data, query)}` : ''}`};`;
  }
  return `${`INSERT\n${query.toString().split('\n').slice(-1).join('\n')} ${
    columnString.length > 0
      ? `(${columnString.join(', ')})\nVALUES${addInsertValuesToQuery(data, query).join(',')}\n`
      : ''
  }${addReturningToQuery(data, query).length > 0 ? `RETURNING ${addReturningToQuery(data, query)}` : ''}`};`;
};

export const addFilterUpdate = (data, query) => {
  const columns = _.cloneDeep(data.columns);

  const filterList = [];

  columns.forEach((column) => {
    if (column.subquerySql.length > 0) {
      filterList.push(`${column.column_filter}(${column.subquerySql.replaceAll('\n', ' ').replace(';', '')})`);
    } else if (column.column_filter.length > 0) {
      filterList.push(`${column.column_filter}`);
    }
  });

  const usingConditions = getUsingConditions(data, query);

  query.where(`(${usingConditions.join(' AND ')}) AND (${filterList.join(' AND ')})`);
};

export const buildUpdateQuery = (data) => {
  const query = squelPostgres.update({
    useAsForTableAliasNames: true,
    fieldAliasQuoteCharacter: '',
    tableAliasQuoteCharacter: '',
    nameQuoteCharacter: '"',
    separator: '\n',
  });

  query.table(`${format.ident(data.tables[0].table_schema)}.${format.ident(data.tables[0].table_name)}`);

  addUpdateValuesToQuery(data, query);

  const usingTables = getUsingTables(data, query);
  const usingConditions = getUsingConditions(data);

  return `${`${
    query.toString() +
    (usingTables.length > 0
      ? `\nFROM ${usingTables.join(', ')}\n` +
        'WHERE ' +
        `(${usingConditions.join(' AND ')})` +
        (addFilterToQueryNew(data).length > 0 ? ` AND ${addFilterToQueryNew(data, query)}` : '')
      : addFilterToQueryNew(data, query).length > 0
        ? `\nWHERE ${addFilterToQueryNew(data, query)}`
        : '')
  }\n${addReturningToQuery(data, query).length > 0 ? `RETURNING ${addReturningToQuery(data, query)}` : ''}`};`;
};

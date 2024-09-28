import * as _ from 'lodash';
import * as format from 'pg-format';
import * as squel from 'squel';

const squelPostgres = squel.useFlavour('postgres');

const addColumnsToQuery = (data, query) => {
  const columns = _.cloneDeep(data.columns);

  let whereQuery = '';
  let havingQuery = '';

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

  const buildFilter = (column, index) => {
    let filtersValue = '';

    if (!_.isEmpty(column.column_filter)) {
      let columnName = `${format.ident(column.table_name)}.${format.ident(column.column_name)}`;

      if (!_.isEmpty(column.table_alias)) {
        columnName = `${format.ident(column.table_alias)}.${format.ident(column.column_name)}`;
      }

      const columnFilter =
        column.filter_as_having && column.column_aggregate
          ? _.replace(column.column_filter, /:c/g, `(${columnName})`)
          : _.replace(column.column_filter, /:c/g, columnName);

      const filterOperand = column.column_filter_operand;

      if (index !== columns.length - 1) {
        if (column.filter_as_having && column.column_aggregate) {
          filtersValue += `${column.column_aggregate}${columnFilter} ${filterOperand} `;
        } else if (column.subquerySql) {
          filtersValue += `${columnFilter}`;
        } else {
          filtersValue += `${columnFilter} ${filterOperand} `;
        }
      } else if (column.filter_as_having && column.column_aggregate) {
        filtersValue += `${column.column_aggregate}${columnFilter}`;
      } else {
        filtersValue += columnFilter;
      }

      if (column.subquerySql) {
        filtersValue += ` (${column.subquerySql.slice(0, -1)}) ${filterOperand} `;
      }
    }

    return filtersValue;
  };

  const cleanFinalFilter = (filterExpression) => {
    let finalFilter = filterExpression.trim().split(' ');

    const lastWord = finalFilter[finalFilter.length - 1];

    if (lastWord === 'AND' || lastWord === 'OR') {
      finalFilter = finalFilter.slice(0, -1);
    } else if (lastWord === 'NOT') {
      finalFilter = finalFilter.slice(0, -2);
    }

    return finalFilter.join(' ').trim();
  };

  columns.forEach((column, index) => {
    if (!data.distinct && column.column_distinct_on) {
      query.distinct(`${format.ident(column.table_name)}.${format.ident(column.column_name)}`);
    }

    if (column.display_in_query) {
      if (column.column_alias.length === 0) {
        if (column.table_alias.length === 0) {
          let field = `${column.column_name}`;

          if (column.column_aggregate.length === 0) {
            addField(column.table_name, column.column_name);
          } else {
            field = `${column.column_aggregate}(${column.table_name}.${field})`;
            query.field(field);
          }
        } else {
          let field = `${column.table_alias}.${column.column_name}`;

          if (column.column_aggregate.length === 0) {
            addField(column.table_alias, column.column_name);
          } else {
            field = `${column.column_aggregate}(${field})`;

            query.field(field);
          }
        }
      } else if (column.table_alias.length === 0) {
        let field = `${column.table_name}.${column.column_name}`;

        if (column.column_aggregate.length === 0) {
          addFieldWithAlias(column.table_name, column.column_name, column.column_alias);
        } else {
          field = `${column.column_aggregate}(${field})`;
          query.field(field, column.column_alias);
        }
      } else {
        let field = `${column.table_alias}.${column.column_name}`;

        if (column.column_aggregate.length === 0) {
          addFieldWithAlias(column.table_alias, column.column_name, column.column_alias);
        } else {
          field = `${column.column_aggregate}(${field})`;
          query.field(field, column.column_alias);
        }
      }
    }

    if (!column.display_in_query && column.column_aggregate) {
      if (!column.column_alias) {
        query.field(`${column.column_aggregate}(*)`);
      } else {
        query.field(`${column.column_aggregate}(*) AS ${column.column_alias}`);
      }
    }

    if (column.column_order) {
      if (_.isEmpty(column.column_alias)) {
        addOrder(column);
      } else {
        query.order(`${format.ident(column.column_alias)}`, column.column_order_dir);
      }
    }

    if (column.column_group_by) {
      if (_.isEmpty(column.table_alias)) {
        addGroupBy(column.table_name, column.column_name);
      } else {
        addGroupBy(column.table_alias, column.column_name);
      }
    }

    if (column.filter_as_having) {
      havingQuery += buildFilter(column, index);
    } else {
      whereQuery += buildFilter(column, index);
    }
  });
  query.where(cleanFinalFilter(whereQuery));
  query.having(cleanFinalFilter(havingQuery));
};

const buildJoinOn = (join) => {
  let mainTable = join.main_table.table_name;

  if (!_.isEmpty(join.main_table.table_alias)) {
    mainTable = join.main_table.table_alias;
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

      const conditionString = `${format.ident(mainTable)}.${format.ident(condition.main_column)} =
             ${format.ident(secondaryTable)}.${format.ident(condition.secondary_column)}`;
      conditionArray.push(conditionString);
    }
  });
  return conditionArray.join(' AND ');
};

const addJoinsToQuery = (data, query) => {
  const joins = _.cloneDeep(data.joins);

  const addJoin = (joinObj, on, joinFn) => {
    if (!_.isEmpty(joinObj.main_table.table_alias)) {
      joinFn(
        `${format.ident(joinObj.main_table.table_schema)}.${format.ident(joinObj.main_table.table_name)}`,
        `${format.ident(joinObj.main_table.table_alias)}`,
        on,
      );
    } else {
      joinFn(
        `${format.ident(joinObj.main_table.table_schema)}.${format.ident(joinObj.main_table.table_name)}`,
        null,
        on,
      );
    }
  };

  joins.forEach((joinObj) => {
    const on = buildJoinOn(joinObj);

    if (!_.isEmpty(joinObj.main_table.table_name) && !_.isEmpty(on)) {
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

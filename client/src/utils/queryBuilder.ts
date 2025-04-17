import * as _ from 'lodash';
import * as format from 'pg-format';
import squel, { JoinMixin } from 'squel';
import { QueryColumnType, JoinType, QueryTableType, QueryType } from '../types/queryTypes';

const squelPostgres = squel.useFlavour('postgres');

const addColumnsToQuery = (data: QueryType, query: squel.PostgresSelect, queries: QueryType[]) => {
  const columns = _.cloneDeep(data.columns);

  const addOrder = (column: QueryColumnType) => {
    // Helper function to check if a string is an expression (contains operators)
    const isExpression = (str: string) => {
      // Check for common SQL operators
      const operators = ['||', '+', '-', '*', '/', 'AND', 'OR', 'IN', 'LIKE', 'IS', 'NOT', 'NULL'];
      return operators.some((op) => str.includes(op));
    };

    // 1) Handle aggregates first
    if (column.column_aggregate && column.column_aggregate.length > 0) {
      // If there is an aggregate, we order by its alias (or auto-generated alias).
      // Use explicit column_alias if provided, otherwise generate an alias
      if (column.column_alias.length > 0) {
        query.order(format.ident(column.column_alias), column.column_order_dir);
      } else {
        // Generate auto alias based on current table reference (not any previous alias)
        const autoAlias = `${column.column_aggregate.toLowerCase()}_${column.column_name}`.toLowerCase();
        query.order(format.ident(autoAlias), column.column_order_dir);
      }
      return;
    }

    // 2) Handle single-line functions
    if (column.column_single_line_function && column.column_single_line_function.length > 0) {
      // If there's an alias, use it directly without wrapping in the function
      if (column.column_alias.length > 0) {
        query.order(format.ident(column.column_alias), column.column_order_dir);
        return;
      }

      // Otherwise, use table_alias or table_name + the column name and wrap in the function
      const tableOrAlias = _.isEmpty(column.table_alias) ? column.table_name : column.table_alias;

      // Check if column_name is an expression
      if (isExpression(column.column_name)) {
        // For expressions, don't use format.ident on the column part and don't prepend table name
        const wrappedField = `${column.column_single_line_function}(${column.column_name})`;
        query.order(wrappedField, column.column_order_dir);
      } else {
        // For regular column names, use format.ident
        const baseExpression = `${format.ident(tableOrAlias)}.${format.ident(column.column_name)}`;
        const wrappedField = `${column.column_single_line_function}(${baseExpression})`;
        query.order(wrappedField, column.column_order_dir);
      }
      return;
    }

    // 3) No aggregate, no single-line function → fallback to alias or table.column
    if (_.isEmpty(column.column_alias)) {
      // Check if column_name is an expression
      if (isExpression(column.column_name)) {
        // For expressions, don't prepend table name
        query.order(column.column_name, column.column_order_dir);
      } else {
        // Use table alias if present, else table_name
        const tableOrAlias = _.isEmpty(column.table_alias) ? column.table_name : column.table_alias;
        // For regular column names, use format.ident
        const orderColumn = `${format.ident(tableOrAlias)}.${format.ident(column.column_name)}`;
        query.order(orderColumn, column.column_order_dir);
      }
    } else {
      query.order(format.ident(column.column_alias), column.column_order_dir);
    }
  };

  const addField = (table: string, column: string) => {
    query.field(`${format.ident(table)}.${format.ident(column)}`);
  };

  const addFieldWithAlias = (table: string, column: string, alias: string) => {
    query.field(`${format.ident(table)}.${format.ident(column)}`, `${format.ident(alias)}`);
  };

  const addGroupBy = (table: string, column: string) => {
    query.group(`${format.ident(table)}.${format.ident(column)}`);
  };

  const matchesIgnoreCase = (str: string, startIndex: number, pattern: string) =>
    str.slice(startIndex, startIndex + pattern.length).toUpperCase() === pattern.toUpperCase();

  /**
   * 2) tokenizeConditionString
   *    - Reads a condition string like "= 'test' OR = 'test2'"
   *    - Ignores OR/AND inside quotes
   *    - Produces a token list, e.g.:
   *      [
   *        { type: 'TEXT', value: "= 'test'" },
   *        { type: 'OPERATOR', value: 'OR' },
   *        { type: 'TEXT', value: "= 'lala'" }
   *      ]
   */
  const tokenizeConditionString = (condition: string) => {
    const str = condition.replace(/"/g, "'"); // Replace double quotes with single quotes
    const tokens = [];

    let insideQuotes = false;
    let current = '';
    let i = 0;

    while (i < str.length) {
      const char = str[i];

      // Toggle quote state if we see a single quote
      if (char === "'") {
        insideQuotes = !insideQuotes;
        current += char;
        i += 1;
        continue;
      }

      // If we are OUTSIDE quotes, check for "OR" or "AND"
      if (!insideQuotes) {
        // Check "OR"
        if (matchesIgnoreCase(str, i, 'OR')) {
          // If we have accumulated some text, push it as TEXT
          if (current.trim().length > 0) {
            tokens.push({ type: 'TEXT', value: current.trim() });
          }
          current = ''; // reset

          // Push operator
          tokens.push({ type: 'OPERATOR', value: 'OR' });

          i += 2; // skip "OR"
          // Skip spaces
          while (i < str.length && /\s/.test(str[i])) {
            i += 1;
          }
          continue;
        }

        // Check "AND"
        if (matchesIgnoreCase(str, i, 'AND')) {
          // If we have accumulated some text, push it
          if (current.trim().length > 0) {
            tokens.push({ type: 'TEXT', value: current.trim() });
          }
          current = ''; // reset

          // Push operator
          tokens.push({ type: 'OPERATOR', value: 'AND' });

          i += 3; // skip "AND"
          // Skip spaces
          while (i < str.length && /\s/.test(str[i])) {
            i += 1;
          }
          continue;
        }
      }

      // Default case: add char to current
      current += char;
      i += 1;
    }

    // End of string: push whatever remains as TEXT
    if (current.trim().length > 0) {
      tokens.push({ type: 'TEXT', value: current.trim() });
    }

    return tokens;
  };

  /**
   * 3) buildConditionString
   *    - Takes tokens from tokenizeConditionString
   *    - For each TEXT token, ensures "columnName = something"
   *      if there's an '=' present (with optional spaces).
   *    - Joins OPERATOR tokens ("OR"/"AND") in between.
   */
  const buildConditionString = (
    tokens: { type: string; value: string }[],
    columnName: string,
    queries: QueryType[],
  ) => {
    let result = '';
    let hasOperator = false; // track if we've seen an OR/AND

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];

      if (token.type === 'TEXT') {
        const textVal = token.value.trim();

        // Check for query references like {Query Name}
        const queryRefRegex = /\{([^{}]+)\}/g;
        let modifiedText = textVal;
        let foundQueryRef = false;

        // Process any query references in the text value
        modifiedText = textVal.replace(queryRefRegex, (match, queryName) => {
          foundQueryRef = true;

          // Find the referenced query (case insensitive)
          const referencedQuery = queries.find((q) => q.queryName.toLowerCase() === queryName.trim().toLowerCase());

          if (referencedQuery) {
            // Build the referenced query (removing trailing semicolon)
            const subquerySql = buildQuery({ data: referencedQuery, queries }).slice(0, -1);
            // Don't add extra parentheses if the subquery already has them
            return subquerySql.startsWith('(') && subquerySql.endsWith(')') ? subquerySql : `(${subquerySql})`;
          }

          // If query not found, keep the original reference
          return match;
        });

        // If no query references were found, process as normal
        if (!foundQueryRef) {
          // If it starts with '=', handle "colName = <stuff>"
          const eqMatch = textVal.match(/^=+\s*(.*)/);
          if (eqMatch) {
            const rightSide = eqMatch[1];
            result += `${columnName} = ${rightSide}`;
          } else {
            // If text doesn't already have columnName, insert it
            if (!textVal.includes(columnName)) {
              result += `${columnName} ${textVal}`;
            } else {
              result += textVal;
            }
          }
        } else {
          // Query reference was found and processed
          // If text starts with '{', default operator is '='
          if (textVal.startsWith('{')) {
            result += `${columnName} = ${modifiedText}`;
          } else {
            // Extract everything before the first '{' as the operator
            const parts = textVal.split('{');
            const operator = parts[0].trim();

            // Rebuild the modifiedText without the operator
            const rightSide = modifiedText.substring(operator.length);

            result += `${columnName} ${operator} ${rightSide}`;
          }
        }
      } else if (token.type === 'OPERATOR') {
        hasOperator = true; // we found an OR/AND
        result += ` ${token.value} `;
      }
    }

    // Only wrap in parentheses if we found an OR or AND token
    // and the result isn't already wrapped in parentheses
    if (hasOperator && !(result.startsWith('(') && result.endsWith(')'))) {
      result = `(${result.trim()})`;
    } else {
      result = result.trim();
    }

    return result;
  };

  /**
   * 4) parseFilterCondition
   *    - The main function that combines tokenizeConditionString + buildConditionString.
   *    - For a raw condition like "= 'test' OR ='lala'", it returns "table.col = 'test' OR table.col = 'lala'".
   *    - Now also supports query references like "IN {Query Name}" which get replaced with subqueries.
   */
  const parseFilterCondition = (condition: string, columnName: string, queries: QueryType[]) => {
    const tokens = tokenizeConditionString(condition);
    return buildConditionString(tokens, columnName, queries);
  };

  /**
   * 5) buildFilters
   *    - For each row index i, gather conditions for all columns and join with "AND".
   *    - Then join each row with "OR".
   *    - Aggregate columns go to HAVING, otherwise WHERE.
   */
  const buildFilters = (columns: QueryColumnType[] = [], queries: QueryType[] = []) => {
    if (!Array.isArray(columns)) {
      return { where: '', having: '' };
    }

    // Figure out how many 'rows' of conditions we have
    const maxConditionsLength = Math.max(
      ...columns.map((col) => (Array.isArray(col.column_conditions) ? col.column_conditions.length : 0)),
      0,
    );

    const whereClauses = [];
    const havingClauses = [];

    for (let i = 0; i < maxConditionsLength; i += 1) {
      const rowWhere: string[] = [];
      const rowHaving: string[] = [];

      columns.forEach((column) => {
        const { table_name = '', column_name = '', table_alias = '', column_aggregate = '' } = column;
        const conditionArr = column.column_conditions || [];
        const condition = conditionArr[i];

        if (condition && condition.trim() !== '') {
          // Build a fully qualified column reference
          let colRef = '';
          if (table_alias && !_.isEmpty(table_alias)) {
            colRef = `${format.ident(table_alias)}.${format.ident(column_name)}`;
          } else {
            colRef = `${format.ident(table_name)}.${format.ident(column_name)}`;
          }

          // If we have an aggregate, that belongs to HAVING
          if (column_aggregate) {
            const aggRef = `${column_aggregate}(${colRef})`;
            rowHaving.push(parseFilterCondition(condition, aggRef, queries));
          } else {
            // Otherwise, normal WHERE
            rowWhere.push(parseFilterCondition(condition, colRef, queries));
          }
        }
      });

      // Join conditions in the same row with AND
      if (rowWhere.length > 0) {
        // Only add parentheses if there's more than one condition
        const whereClause = rowWhere.length > 1 ? `(${rowWhere.join(' AND ')})` : rowWhere[0];
        whereClauses.push(whereClause);
      }
      if (rowHaving.length > 0) {
        // Only add parentheses if there's more than one condition
        const havingClause = rowHaving.length > 1 ? `(${rowHaving.join(' AND ')})` : rowHaving[0];
        havingClauses.push(havingClause);
      }
    }

    // Only add outer parentheses if there's more than one clause
    const where = whereClauses.length > 1 ? whereClauses.join(' OR ') : whereClauses.join('');
    const having = havingClauses.length > 1 ? havingClauses.join(' OR ') : havingClauses.join('');

    return { where, having };
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

  // Handle ordering separately, sorted by column_order_nr
  columns
    // First filter to keep only columns that should be in ORDER BY (where column_order is true)
    .filter((column) => column.column_order)
    // Then sort those columns by their order_nr
    .sort((a, b) => {
      // Convert column_order_nr to number for sorting, defaulting to MAX_SAFE_INTEGER for nulls
      // This ensures columns without a specific order number appear last
      const aOrder = typeof a.column_order_nr === 'number' ? a.column_order_nr : Number.MAX_SAFE_INTEGER;
      const bOrder = typeof b.column_order_nr === 'number' ? b.column_order_nr : Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    })
    // Then add each column to the query's ORDER BY clause
    .forEach((column) => {
      addOrder(column);
    });

  // Build and apply the WHERE and HAVING clauses
  const { where, having } = buildFilters(columns, queries);
  if (where) {
    query.where(where);
  }
  if (having) {
    query.having(having);
  }
};

const addJoinsToQuery = (data: QueryType, query: squel.PostgresSelect) => {
  const joins = _.cloneDeep(data.joins);

  const addJoin = (joinObj: JoinType, on: string, joinFn: JoinMixin['join']) => {
    if (!_.isEmpty(joinObj.main_table.table_alias)) {
      joinFn(
        `${format.ident(joinObj.main_table.table_schema)}.${format.ident(joinObj.main_table.table_name)}`,
        `${format.ident(joinObj.main_table.table_alias)}`,
        on,
      );
    } else {
      joinFn(
        `${format.ident(joinObj.main_table.table_schema)}.${format.ident(joinObj.main_table.table_name)}`,
        undefined,
        on,
      );
    }
  };

  // Group joins by their main table and secondary table
  const groupedJoins: { [key: string]: JoinType[] } = {};

  joins.forEach((joinObj) => {
    if (!_.isEmpty(joinObj.main_table.table_name)) {
      // Create a unique key for each main_table + secondary_table combination
      const conditions = joinObj.conditions || [];
      conditions.forEach((condition) => {
        if (!_.isEmpty(condition.secondary_table.table_name)) {
          const key = `${joinObj.main_table.table_name}_${condition.secondary_table.table_name}`;
          if (!groupedJoins[key]) {
            groupedJoins[key] = [];
          }
          groupedJoins[key].push(joinObj);
        }
      });
    }
  });

  // Process each group of joins
  Object.keys(groupedJoins).forEach((key) => {
    const joinGroup = groupedJoins[key];
    if (joinGroup.length > 0) {
      // Use the first join in the group as the template
      const templateJoin = joinGroup[0];

      // Collect all conditions from all joins in this group
      const allConditions: string[] = [];

      joinGroup.forEach((joinObj) => {
        const conditions = joinObj.conditions || [];
        conditions.forEach((condition) => {
          if (
            !_.isEmpty(condition.main_column) &&
            !_.isEmpty(condition.secondary_column) &&
            !_.isEmpty(condition.secondary_table.table_name) &&
            condition.secondary_table.table_name === templateJoin.conditions[0].secondary_table.table_name
          ) {
            let mainTable = joinObj.main_table.table_name;
            if (!_.isEmpty(joinObj.main_table.table_alias)) {
              mainTable = joinObj.main_table.table_alias;
            }

            let secondaryTable = condition.secondary_table.table_name;
            if (!_.isEmpty(condition.secondary_table.table_alias)) {
              secondaryTable = condition.secondary_table.table_alias;
            }

            const conditionString = `${format.ident(mainTable)}.${format.ident(condition.main_column)} =
                   ${format.ident(secondaryTable)}.${format.ident(condition.secondary_column)}`;
            allConditions.push(conditionString);
          }
        });
      });

      // Combine all conditions with AND
      const combinedOn = allConditions.join(' AND ');

      if (!_.isEmpty(combinedOn)) {
        // Apply the join with the combined conditions
        switch (templateJoin.type) {
          case 'inner': {
            addJoin(templateJoin, combinedOn, query.join);
            break;
          }
          case 'right': {
            addJoin(templateJoin, combinedOn, query.right_join);
            break;
          }
          case 'left': {
            addJoin(templateJoin, combinedOn, query.left_join);
            break;
          }
          case 'outer': {
            addJoin(templateJoin, combinedOn, query.outer_join);
            break;
          }
          case 'cross': {
            addJoin(templateJoin, combinedOn, query.cross_join);
            break;
          }
          default:
            break;
        }
      }
    }
  });
};

const addJoinsToQueryByDragAndDrop = (data: QueryType, query: squel.PostgresSelect) => {
  const joins = _.cloneDeep(data.joins);

  const addJoin = (joinObj: JoinType, on: string, joinFn: JoinMixin['join']) => {
    if (!_.isEmpty(joinObj.main_table.table_alias)) {
      joinFn(
        `${format.ident(joinObj.main_table.table_schema)}.${format.ident(joinObj.main_table.table_name)}`,
        `${format.ident(joinObj.main_table.table_alias)}`,
        on,
      );
    } else {
      joinFn(
        `${format.ident(joinObj.main_table.table_schema)}.${format.ident(joinObj.main_table.table_name)}`,
        undefined,
        on,
      );
    }
  };

  // Group joins by their main table and secondary table
  const groupedJoins: { [key: string]: JoinType[] } = {};

  joins.forEach((joinObj) => {
    if (!_.isEmpty(joinObj.main_table.table_name)) {
      // Create a unique key for each main_table + secondary_table combination
      const conditions = joinObj.conditions || [];
      conditions.forEach((condition) => {
        if (!_.isEmpty(condition.secondary_table.table_name)) {
          const key = `${joinObj.main_table.table_name}_${condition.secondary_table.table_name}`;
          if (!groupedJoins[key]) {
            groupedJoins[key] = [];
          }
          groupedJoins[key].push(joinObj);
        }
      });
    }
  });

  // Process each group of joins
  Object.keys(groupedJoins).forEach((key) => {
    const joinGroup = groupedJoins[key];
    if (joinGroup.length > 0) {
      // Use the first join in the group as the template
      const templateJoin = joinGroup[0];

      // Collect all conditions from all joins in this group
      const allConditions: string[] = [];

      joinGroup.forEach((joinObj) => {
        const conditions = joinObj.conditions || [];
        conditions.forEach((condition) => {
          if (
            !_.isEmpty(condition.main_column) &&
            !_.isEmpty(condition.secondary_column) &&
            !_.isEmpty(condition.secondary_table.table_name) &&
            condition.secondary_table.table_name === templateJoin.conditions[0].secondary_table.table_name
          ) {
            let mainTable = joinObj.main_table.table_name;
            if (!_.isEmpty(joinObj.main_table.table_alias)) {
              mainTable = joinObj.main_table.table_alias;
            }

            let secondaryTable = condition.secondary_table.table_name;
            if (!_.isEmpty(condition.secondary_table.table_alias)) {
              secondaryTable = condition.secondary_table.table_alias;
            }

            const conditionString = `${format.ident(mainTable)}.${format.ident(condition.main_column)} =
                   ${format.ident(secondaryTable)}.${format.ident(condition.secondary_column)}`;
            allConditions.push(conditionString);
          }
        });
      });

      // Combine all conditions with AND
      const combinedOn = allConditions.join(' AND ');

      if (!_.isEmpty(combinedOn)) {
        // Apply the join with the combined conditions
        switch (templateJoin.type) {
          case 'inner': {
            addJoin(templateJoin, combinedOn, query.join);
            break;
          }
          case 'right': {
            addJoin(templateJoin, combinedOn, query.right_join);
            break;
          }
          case 'left': {
            addJoin(templateJoin, combinedOn, query.left_join);
            break;
          }
          case 'outer': {
            addJoin(templateJoin, combinedOn, query.outer_join);
            break;
          }
          case 'cross': {
            addJoin(templateJoin, combinedOn, query.cross_join);
            break;
          }
          default:
            break;
        }
      }
    }
  });
};

const buildSetQuery = (data: QueryType) => {
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

const addTablesToQuery = (data: QueryType, query: squel.PostgresSelect) => {
  const addTable = (table: QueryTableType) => {
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
      if (data.isDragAndDrop) {
        addJoinsToQueryByDragAndDrop(data, query);
      } else {
        addJoinsToQuery(data, query);
      }
      buildSetQuery(data);
    }
  }
};

export const buildQuery = ({ data, queries }: { data: QueryType; queries: QueryType[] }) => {
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

  if (queries) {
    addColumnsToQuery(data, query, queries);
  }
  addTablesToQuery(data, query);

  const setQueryString = buildSetQuery(data);

  if (data.limit && data.limitValue) {
    return `${`${query.toString() + setQueryString}\n` + `FETCH FIRST ${data.limitValue} ROWS ${data.withTies ? 'WITH TIES;' : 'ONLY;'}`}`;
  }

  return `${query}${setQueryString};`;
};

const addFilterToQueryNew = (data: QueryType) => {
  const columns = _.cloneDeep(data.columns);

  let whereQuery = '';
  const filterList: { id: number; filter: string }[] = [];
  let filterLength = 0;

  if (columns[0]) {
    filterLength = columns[0].column_filters.length;
  }

  columns.forEach((column: QueryColumnType) => {
    column.column_filters.forEach((filter) => {
      if (filter.filter.length > 0 && !column.returningOnly) {
        filterList.push({ id: filter.id, filter: `${column.table_name}.${column.column_name} ${filter.filter}` });
      }
    });
  });

  const finalFilter = [];

  for (let i = 0; i < filterLength + 1; i += 1) {
    const filterRow: string[] = [];
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

const getUsingTables = (data: QueryType) => {
  const usings = _.cloneDeep(data.using);

  const usingTables: string[] = [];

  usings.forEach((using) => {
    usingTables.push(`${using.main_table.table_schema}.${using.main_table.table_name}`);
  });

  return usingTables;
};

const getUsingConditions = (data: QueryType) => {
  const usings = _.cloneDeep(data.using);

  const usingConditions: string[] = [];

  usings.forEach((using) => {
    using.conditions.forEach((condition) => {
      usingConditions.push(
        `${condition.secondary_table.table_name}.${condition.secondary_column} = ${using.main_table.table_name}.${condition.main_column}`,
      );
    });
  });

  return usingConditions;
};

const addReturningToQuery = (data: QueryType) => {
  const columns = _.cloneDeep(data.columns);

  let returning = '';
  const returningColumns: string[] = [];

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

const addInsertValuesToQuery = (data: QueryType, query: squel.PostgresInsert) => {
  const columns = _.cloneDeep(data.columns);
  const valuesList = [];

  for (let i = 0; i < data.rows; i += 1) {
    const valueRow: Record<string, string> = {};

    columns.forEach((column) => {
      if (!column.returningOnly) {
        if (column.column_values[i].value === '') {
          valueRow[column.column_name] = 'NULL';
        } else {
          valueRow[column.column_name] = column.column_values[i].value;
        }
      }
    });

    query.setFields(valueRow, { ignorePeriodsForFieldNameQuotes: true });
    valuesList.push(query.toString().split('\n').slice(-1).toString().split('VALUES').slice(-1));
  }
  return valuesList;
};

const addUpdateValuesToQuery = (data: QueryType, query: squel.PostgresUpdate) => {
  const columns = _.cloneDeep(data.columns);

  columns.forEach((column) => {
    if (!column.returningOnly && column.table_id === data.tables[0].id && column.value_enabled) {
      query.set(column.column_name, column.column_value, { dontQuote: true });
    }
  });
};

export const buildDeleteQuery = (data: QueryType) => {
  const query = squelPostgres.delete({
    useAsForTableAliasNames: true,
    fieldAliasQuoteCharacter: '',
    tableAliasQuoteCharacter: '',
    nameQuoteCharacter: '"',
    separator: '\n',
  });

  query.from(`${format.ident(data.tables[0].table_schema)}.${format.ident(data.tables[0].table_name)}`);

  const usingTables = getUsingTables(data);
  const usingConditions = getUsingConditions(data);

  return `${`${
    query.toString() +
    (usingTables.length > 0
      ? `\nUSING ${usingTables.join(', ')}\n` +
        'WHERE ' +
        `(${usingConditions.join(' AND ')})` +
        (addFilterToQueryNew(data).length > 0 ? ` AND ${addFilterToQueryNew(data)}` : '')
      : addFilterToQueryNew(data).length > 0
        ? `\nWHERE ${addFilterToQueryNew(data)}`
        : '')
  }\n${addReturningToQuery(data).length > 0 ? `RETURNING ${addReturningToQuery(data)}` : ''}`};`;
};

export const buildInsertQuery = (data: QueryType) => {
  const query = squelPostgres.insert({
    useAsForTableAliasNames: true,
    fieldAliasQuoteCharacter: '',
    tableAliasQuoteCharacter: '',
    nameQuoteCharacter: '"',
    separator: '\n',
  });

  query.into(`${format.ident(data.tables[0].table_schema)}.${format.ident(data.tables[0].table_name)}`);

  const columnString: string[] = [];
  data.columns.forEach((column) => {
    if (!column.returningOnly) {
      columnString.push(column.column_name);
    }
  });

  if (data.fromQuery) {
    const columnsPart = columnString.length > 0 ? `(${columnString.join(', ')})` : '';
    const subqueryPart = data.subquerySql.slice(0, -1);
    const returningPart = addReturningToQuery(data).length > 0 ? `RETURNING ${addReturningToQuery(data)}` : '';

    return `${query.toString()} ${columnsPart}\n${subqueryPart}\n${returningPart};`;
  }

  const lastQueryLine = query.toString().split('\n').slice(-1).join('\n');
  const columnsPart =
    columnString.length > 0
      ? `(${columnString.join(', ')})\nVALUES ${addInsertValuesToQuery(data, query).join(',')}\n`
      : '';
  const returningPart = addReturningToQuery(data).length > 0 ? `RETURNING ${addReturningToQuery(data)}` : '';

  return `INSERT\n${lastQueryLine} ${columnsPart}${returningPart};`;
};

export const buildUpdateQuery = (data: QueryType) => {
  const query = squelPostgres.update({
    useAsForTableAliasNames: true,
    fieldAliasQuoteCharacter: '',
    tableAliasQuoteCharacter: '',
    nameQuoteCharacter: '"',
    separator: '\n',
  });

  query.table(`${format.ident(data.tables[0].table_schema)}.${format.ident(data.tables[0].table_name)}`);

  addUpdateValuesToQuery(data, query);

  const usingTables = getUsingTables(data);
  const usingConditions = getUsingConditions(data);

  return `${`${
    query.toString() +
    (usingTables.length > 0
      ? `\nFROM ${usingTables.join(', ')}\n` +
        'WHERE ' +
        `(${usingConditions.join(' AND ')})` +
        (addFilterToQueryNew(data).length > 0 ? ` AND ${addFilterToQueryNew(data)}` : '')
      : addFilterToQueryNew(data).length > 0
        ? `\nWHERE ${addFilterToQueryNew(data)}`
        : '')
  }\n${addReturningToQuery(data).length > 0 ? `RETURNING ${addReturningToQuery(data)}` : ''}`};`;
};

import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Button, Input } from 'reactstrap';
import { removeColumn, updateColumn } from '../actions/queryActions';
import { bannedWords } from '../utils/bannedWords';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';

const QueryCreationTableColumn: React.FC<{ data: QueryColumnType; id: string; index: number }> = ({
  data,
  id,
  index,
}) => {
  console.log({ data });
  const dispatch = useAppDispatch();
  const { distinct, columns, queries, query } = useAppSelector((store) => ({
    distinct: store.query.distinct,
    queries: store.queries.filter((query) => query.id !== 0).sort((query1, query2) => query1.id - query2.id),
    columns: store.query.columns,
    query: store.query,
  }));
  const maxConditions = Math.max(...columns.map((col) => col.column_conditions.length), data.column_conditions.length);
  const [filterValid, setFilterValid] = useState(true);

  const scalarFunctions = (process.env.REACT_APP_SCALAR_FUNCTIONS || '').split(',');
  const singleLineFunctions = (process.env.REACT_APP_SINGE_LINE_FUNCTIONS || '').split(',');

  const [conditionsData, setConditionsData] = useState<string[]>(data.column_conditions);
  const [showQuerySuggestions, setShowQuerySuggestions] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(-1);
  const [currentFilter, setCurrentFilter] = useState<string>('');
  const textareaRefs = React.useRef<(HTMLTextAreaElement | HTMLInputElement | null)[]>([]);

  // Reset conditions data when query ID changes
  useEffect(() => {
    setConditionsData(data.column_conditions);
  }, [query.id, data.column_conditions]);

  // Get filtered query suggestions based on what user has typed after '{'
  const getFilteredQuerySuggestions = () => {
    if (!showQuerySuggestions || activeInputIndex === -1) return [];

    const filterValue = conditionsData[activeInputIndex] || '';
    const lastOpenBraceIndex = filterValue.lastIndexOf('{', cursorPosition);

    if (lastOpenBraceIndex === -1) return [];

    const closeBraceIndex = filterValue.indexOf('}', lastOpenBraceIndex);

    // Check if cursor is between braces
    if (closeBraceIndex !== -1 && cursorPosition > closeBraceIndex) return [];

    const endIndex = closeBraceIndex !== -1 && closeBraceIndex < cursorPosition ? closeBraceIndex : cursorPosition;

    const partialQuery = filterValue
      .substring(lastOpenBraceIndex + 1, endIndex)
      .trim()
      .toLowerCase();

    if (partialQuery === '') {
      return queries.map((query) => query.queryName);
    }
    return queries.filter((q) => q.queryName.toLowerCase().includes(partialQuery)).map((q) => q.queryName);
  };

  // Handle selecting a query from suggestions
  const handleSelectQuery = (queryName: string) => {
    if (activeInputIndex === -1) return;

    const filterValue = conditionsData[activeInputIndex] || '';
    const lastOpenBraceIndex = filterValue.lastIndexOf('{', cursorPosition);

    if (lastOpenBraceIndex === -1) return;

    const closeBraceIndex = filterValue.indexOf('}', lastOpenBraceIndex);

    let newValue = '';
    if (closeBraceIndex !== -1 && closeBraceIndex > lastOpenBraceIndex) {
      // Replace existing query name between braces
      newValue = filterValue.substring(0, lastOpenBraceIndex + 1) + queryName + filterValue.substring(closeBraceIndex);
    } else {
      // Insert query name and add closing brace if needed
      newValue =
        filterValue.substring(0, lastOpenBraceIndex + 1) + queryName + '}' + filterValue.substring(cursorPosition);
    }

    setConditionsData((prevData) => {
      const newData = [...prevData];
      newData[activeInputIndex] = newValue;
      return newData;
    });

    setShowQuerySuggestions(false);

    // Focus back on textarea and position cursor after the inserted query name
    setTimeout(() => {
      const textarea = textareaRefs.current[activeInputIndex];
      if (textarea) {
        textarea.focus();
        const newPosition = lastOpenBraceIndex + queryName.length + 2; // +2 for { and }
        textarea.selectionStart = newPosition;
        textarea.selectionEnd = newPosition;
      }
    }, 0);
  };

  const updateFilterValue = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const target = e.target;
    const value = target.value;
    const cursorPos = target.selectionStart || 0;
    setCursorPosition(cursorPos);
    setActiveInputIndex(index);
    setCurrentFilter(value);

    // Check if the user just typed an opening brace
    if (value[cursorPos - 1] === '{') {
      // Show query suggestions if there are any available queries
      if (queries.length > 0) {
        setShowQuerySuggestions(true);
      }

      // Check if there's already a closing brace ahead
      const nextCloseBraceIndex = value.indexOf('}', cursorPos);

      // Only add a closing brace if one doesn't exist already
      if (nextCloseBraceIndex === -1) {
        // Create a new value with closing brace
        const newValue = value.substring(0, cursorPos) + '}' + value.substring(cursorPos);

        // Update the state
        setConditionsData((prevConditionsData) => {
          const newConditionsData = [...prevConditionsData];
          newConditionsData[index] = newValue;
          return newConditionsData;
        });

        // Position cursor between braces
        setTimeout(() => {
          if (target) {
            target.selectionStart = cursorPos;
            target.selectionEnd = cursorPos;
            target.focus();
          }
        }, 0);
      } else {
        // Just update with the current value
        setConditionsData((prevConditionsData) => {
          const newConditionsData = [...prevConditionsData];
          newConditionsData[index] = value;
          return newConditionsData;
        });
      }
    } else {
      // Check if we should show suggestions (we're between { and })
      const lastOpenBraceIndex = value.lastIndexOf('{', cursorPos - 1);
      const nextCloseBraceIndex = value.indexOf('}', lastOpenBraceIndex);

      if (
        lastOpenBraceIndex !== -1 &&
        cursorPos > lastOpenBraceIndex &&
        (nextCloseBraceIndex === -1 || cursorPos <= nextCloseBraceIndex) &&
        queries.length > 0
      ) {
        setShowQuerySuggestions(true);
      } else {
        setShowQuerySuggestions(false);
      }

      // Normal update without adding closing brace
      setConditionsData((prevConditionsData) => {
        const newConditionsData = [...prevConditionsData];
        newConditionsData[index] = value;
        return newConditionsData;
      });
    }
  };

  const handleFilterChange = (index: number) => {
    // First, create a deep copy of the original data
    const column = _.cloneDeep(data);
    const filterValue = conditionsData[index];

    // Update the specific condition at the given index
    column.column_conditions[index] = filterValue;

    // Get the last two conditions
    const lastTwo = column.column_conditions.slice(-2);

    // If this is the second-to-last condition and it's being filled
    if (index === column.column_conditions.length - 1 && filterValue !== '') {
      column.column_conditions.push(''); // Add new empty condition
    }
    // If the last two conditions are empty and we have more than 2 conditions
    else if (
      lastTwo.every((condition) => condition === '' || condition === null) &&
      column.column_conditions.length > 2
    ) {
      column.column_conditions.pop(); // Remove the last empty condition
    }

    const filter = _.lowerCase(filterValue).split(' ');

    let contains = false;
    bannedWords.forEach((el) => {
      if (filter.includes(el)) {
        contains = true;
      }
    });

    if (contains) {
      setFilterValid(false);
    } else {
      setFilterValid(true);
      dispatch(updateColumn(column));
    }
  };

  const changeColumnOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let column = _.cloneDeep(data);
    const isOrdering = e.target.value !== '';

    column = {
      ...column,
      column_order: isOrdering,
      column_order_dir: e.target.value === 'ASC',
    };

    dispatch(updateColumn(column));
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let column = _.cloneDeep(data);
    column = {
      ...column,
      [e.target.name]: !column[e.target.name as keyof QueryColumnType],
    };
    dispatch(updateColumn(column));
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    // Create a new column object based on the current data
    const column = {
      ..._.cloneDeep(data),
      [name]: value,
    };

    // Update the column in Redux
    dispatch(updateColumn(column));
  };

  const handleOnSave = (e: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    let column = _.cloneDeep(data);
    const name = e.target.name;
    const value = e.target.value;

    column = {
      ...column,
      [name]: value,
    };

    // Generate auto alias when adding aggregate or single line function
    if (name === 'column_aggregate' || name === 'column_single_line_function') {
      if (value && !column.column_name.toUpperCase().includes(' AS ') && !column.column_alias) {
        column.column_alias = `${value.toLowerCase()}_${column.column_name}`.toLowerCase().replace(/\./g, '_');
      } else if (!value) {
        column.column_alias = '';
      }
    }

    // remove double quotes from column_alias
    column.column_alias = column.column_alias.replace(/"/g, '');

    dispatch(updateColumn(column));
  };

  const handleRemoveColumn = () => {
    dispatch(removeColumn(data));
  };
  return (
    <td>
      <table>
        <tbody>
          <tr style={{ height: '56px' }}>
            <td className="p-2 text-center d-flex align-items-center justify-content-center gap-2 h-100">
              <Input
                type="text"
                name={`column_name`}
                id={`column-name-${data.id}`}
                onChange={(e) => handleOnChange(e)}
                value={data.column_name}
              />
              <Button size={'sm'} className={'ml-4'} onClick={handleRemoveColumn}>
                X
              </Button>
            </td>
          </tr>
          <tr key={index} style={{ height: '56px' }}>
            <td className="p-2">
              <Input
                type="text"
                name={`column_alias`}
                id={`column-alias-${data.id}`}
                onChange={(e) => handleOnChange(e)}
                value={data.column_alias}
              />
            </td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2 text-center">{data.table_name}</td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <select
                className="form-control"
                onChange={(e) => handleOnSave(e)}
                name="column_aggregate"
                id={`column-aggregate-${data.id}`}
                value={data.column_aggregate}
              >
                <option aria-label="Select an option" value="" />
                {singleLineFunctions.map((scalarFunction) => (
                  <option key={scalarFunction} value={scalarFunction}>
                    {scalarFunction}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <select
                className="form-control"
                onChange={(e) => handleOnSave(e)}
                name="column_single_line_function"
                id={`column-single-line-function-${data.id}`}
                value={data.column_single_line_function}
              >
                <option aria-label="Select an option" value="" />
                {scalarFunctions.map((scalarFunction) => (
                  <option key={scalarFunction} value={scalarFunction}>
                    {scalarFunction}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <select className="form-control" onChange={changeColumnOrder}>
                <option selected={!data.column_order} value="" aria-label="Select an option" />
                <option selected={data.column_order && data.column_order_dir} value="ASC">
                  ASC
                </option>
                <option selected={data.column_order && !data.column_order_dir} value="DESC">
                  DESC
                </option>
              </select>
            </td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <select
                className="form-control"
                onChange={(e) => handleOnSave(e)}
                name="column_sort_order"
                id={`column-sort-order-${data.id}`}
                value={data.column_sort_order}
              >
                <option aria-label="Select an option" value="" />
                {[...Array(columns.length)].map((_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <input
                className="w-100"
                type="checkbox"
                defaultChecked={data.display_in_query}
                id={`display-${data.id}`}
                name="display_in_query"
                onChange={(e) => handleSwitch(e)}
              />
            </td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <input
                className="w-100"
                type="checkbox"
                disabled={distinct}
                defaultChecked={data.column_distinct_on}
                id={`column-distinct-on-${data.id}`}
                name="column_distinct_on"
                onChange={(e) => handleSwitch(e)}
              />
            </td>
          </tr>
          {[...Array(maxConditions)].map((_, index) => (
            <tr key={index} style={{ height: '56px' }}>
              <td className="p-2">
                <div style={{ position: 'relative' }}>
                  <Input
                    type="textarea"
                    rows={1}
                    name={`column_filter_${data.id}_${index}`}
                    id={`column-filter-${data.id}-${index}`}
                    className={filterValid ? '' : 'is-invalid'}
                    onBlur={() => handleFilterChange(index)}
                    onChange={(e) => updateFilterValue(e, index)}
                    value={conditionsData[index] || ''}
                    innerRef={(el) => {
                      textareaRefs.current[index] = el;
                    }}
                    onFocus={(e) => {
                      setActiveInputIndex(index);
                      setCursorPosition(e.target.selectionStart || 0);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowQuerySuggestions(false);
                      }
                    }}
                  />

                  {showQuerySuggestions && activeInputIndex === index && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #ced4da',
                        borderRadius: '0.25rem',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        width: '100%',
                      }}
                    >
                      {getFilteredQuerySuggestions().length > 0 ? (
                        getFilteredQuerySuggestions().map((queryName, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              backgroundColor: i === 0 ? '#f0f0f0' : 'transparent',
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevent blur
                              handleSelectQuery(queryName);
                            }}
                          >
                            {queryName}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '8px 12px', color: '#6c757d' }}>No matching queries</div>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </td>
  );
};

export default QueryCreationTableColumn;

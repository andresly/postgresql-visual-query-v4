import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Button, Input, CustomInput } from 'reactstrap';
import { removeColumn, updateColumn } from '../actions/queryActions';
import { bannedWords } from '../utils/bannedWords';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { Draggable } from 'react-beautiful-dnd';
import { getScalarFunctions, getAggregateFunctions } from '../utils/functionUtils';

const QueryCreationTableColumn: React.FC<{ data: QueryColumnType; id: string; index: number }> = ({
  data,
  id,
  index,
}) => {
  const dispatch = useAppDispatch();
  const { columns, queries, query } = useAppSelector((store) => ({
    distinct: store.query.distinct,
    queries: store.queries.filter((query) => query.id !== 0).sort((query1, query2) => query1.id - query2.id),
    columns: store.query.columns,
    query: store.query,
  }));
  const maxConditions = Math.max(...columns.map((col) => col.column_conditions.length), data.column_conditions.length);
  const [filterValid, setFilterValid] = useState(true);

  const scalarFunctions = getScalarFunctions();
  const singleLineFunctions = getAggregateFunctions();

  const [conditionsData, setConditionsData] = useState<string[]>(data.column_conditions);
  const [showQuerySuggestions, setShowQuerySuggestions] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [activeInputIndex, setActiveInputIndex] = useState<number>(-1);
  const textareaRefs = React.useRef<(HTMLTextAreaElement | HTMLInputElement | null)[]>([]);
  const [isCanShowDisabled, setIsCanShowDisabled] = useState(
    !data.column_alias && !data.column_name && !data.table_name,
  );

  // Local state for input fields
  const [columnName, setColumnName] = useState(data.column_name);
  const [columnAlias, setColumnAlias] = useState(data.column_alias);
  const [tableName, setTableName] = useState(data.table_name);

  // Reset conditions data when query ID changes
  useEffect(() => {
    setConditionsData(data.column_conditions);
    setColumnName(data.column_name);
    setColumnAlias(data.column_alias);
    setTableName(data.table_name);
  }, [query.id, data.column_conditions, data.column_name, data.column_alias, data.table_name]);

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

  useEffect(() => {
    if (!data.column_alias && !data.column_name && !data.table_name) {
      let column = _.cloneDeep(data);
      column = {
        ...column,
        display_in_query: false,
      };
      dispatch(updateColumn(column));
      setIsCanShowDisabled(true);
    } else {
      setIsCanShowDisabled(false);
    }
  }, [data.column_alias, data.column_name, data.table_name]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    // Only update local state based on field name
    if (name === 'column_name') {
      setColumnName(value);
    } else if (name === 'column_alias') {
      setColumnAlias(value);
    } else if (name === 'table_name') {
      setTableName(value);
    }
  };

  const handleOnSave = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const name = e.target.name;
    const value = e.target.value;

    // Create a new column object based on the current data
    let column = {
      ..._.cloneDeep(data),
      [name]: name === 'column_order_nr' ? (value === '' ? null : parseInt(value, 10)) : value,
    };

    // If column_order_nr is set to a number, ensure column_order is true
    if (name === 'column_order_nr' && value !== '') {
      column = {
        ...column,
        column_order: true,
      };
    }

    // Update the state with the new column
    dispatch(updateColumn(column));
  };

  const handleRemoveColumn = () => {
    dispatch(removeColumn(data));
  };

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            display: 'flex',
            flexDirection: 'column',
            minWidth: '200px',
            opacity: snapshot.isDragging ? 0.8 : 1,
            border: '1px solid #dee2e6',
            borderLeft: 'none',
            borderTop: 'none',
          }}
        >
          <div
            {...provided.dragHandleProps}
            style={{
              height: '30px',
              background: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              borderBottom: '1px solid #ddd',
            }}
          >
            <FontAwesomeIcon icon={faGripVertical} />
            <Button size={'sm'} className={'ml-4'} onClick={handleRemoveColumn}>
              X
            </Button>
          </div>

          {/* Column name */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <textarea
              rows={1}
              name="column_name"
              value={columnName}
              onChange={handleOnChange}
              onBlur={(e) => {
                const column = { ..._.cloneDeep(data), column_name: columnName };
                dispatch(updateColumn(column));
              }}
              className="form-control"
              style={{ resize: 'both' }}
            />
          </div>

          {/* Alias */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <Input
              type="text"
              name="column_alias"
              value={columnAlias}
              onChange={handleOnChange}
              onBlur={(e) => {
                const column = { ..._.cloneDeep(data), column_alias: columnAlias };
                dispatch(updateColumn(column));
              }}
              placeholder="Alias"
            />
          </div>

          {/* Table */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <Input
              type="text"
              name="table_name"
              value={tableName}
              onChange={handleOnChange}
              onBlur={(e) => {
                const column = { ..._.cloneDeep(data), table_name: tableName };
                dispatch(updateColumn(column));
              }}
            />
          </div>

          {/* Aggregate */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <select
              name="column_aggregate"
              value={data.column_aggregate}
              onChange={(e) => {
                // Create a deep copy of the column data
                const column = _.cloneDeep(data);
                // Update the aggregate function
                column.column_aggregate = e.target.value;
                // Immediately dispatch the update to Redux
                dispatch(updateColumn(column));
              }}
              className="form-control"
            >
              <option value="">None</option>
              {singleLineFunctions.map((func) => (
                <option key={func} value={func}>
                  {func}
                </option>
              ))}
            </select>
          </div>

          {/* Scalar function */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <select
              name="column_single_line_function"
              value={data.column_single_line_function}
              onChange={(e) => {
                // Create a deep copy of the column data
                const column = _.cloneDeep(data);
                // Update the scalar function
                column.column_single_line_function = e.target.value;
                // Immediately dispatch the update to Redux
                dispatch(updateColumn(column));
              }}
              className="form-control"
            >
              <option value="">None</option>
              {scalarFunctions.map((func) => (
                <option key={func} value={func}>
                  {func}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <select
              name="column_order"
              value={data.column_order ? (data.column_order_dir ? 'ASC' : 'DESC') : ''}
              onChange={changeColumnOrder}
              className="form-control"
            >
              <option value="">None</option>
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>

          {/* Sort order */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <Input
              type="number"
              name="column_order_nr"
              value={data.column_order_nr || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                // Only allow positive numbers
                if (value === '' || parseInt(value, 10) > 0) {
                  handleOnSave(e as any);
                }
              }}
              min="1"
              className="form-control"
              placeholder="Sort order number"
            />
          </div>

          {/* Show */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <CustomInput
              type="checkbox"
              id={`show-${id}`}
              label="Show"
              checked={data.display_in_query}
              disabled={isCanShowDisabled}
              onChange={handleSwitch}
              name="display_in_query"
            />
          </div>

          {/* Remove Duplicates */}
          <div style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
            <CustomInput
              type="checkbox"
              id={`distinct-${id}`}
              label="Remove Duplicates"
              checked={data.column_distinct_on}
              onChange={handleSwitch}
              name="column_distinct_on"
            />
          </div>

          {/* Criteria */}
          {Array.from({ length: maxConditions }).map((_, i) => (
            <div key={i} style={{ minHeight: '56px', padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
              <textarea
                rows={1}
                ref={(el) => {
                  textareaRefs.current[i] = el;
                }}
                value={conditionsData[i] || ''}
                onChange={(e) => updateFilterValue(e, i)}
                onBlur={() => handleFilterChange(i)}
                className={`form-control ${!filterValid && i === activeInputIndex ? 'is-invalid' : ''}`}
                style={{ resize: 'both', height: '38px' }}
              />
              {showQuerySuggestions && i === activeInputIndex && (
                <div
                  style={{
                    position: 'absolute',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    width: '200px',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                >
                  {getFilteredQuerySuggestions().map((queryName) => (
                    <div
                      key={queryName}
                      onClick={() => handleSelectQuery(queryName)}
                      style={{
                        padding: '8px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      {queryName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Draggable>
  );
};

export default QueryCreationTableColumn;

import React, { useEffect, useState, useMemo, useCallback, useRef, useContext, createContext } from 'react';
// @ts-ignore
import { useTable, Column } from 'react-table';
import _ from 'lodash';
import { Button, ButtonGroup, Alert, Badge, Input, InputGroup } from 'reactstrap';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchTableData, fetchTableCount } from '../actions/tableViewActions';

// Add this for TypeScript to recognize react-table

interface TableViewProps {
  tableId: number;
}

// Row number cell component defined outside of the render function
interface RowNumberCellProps {
  value: number;
  page: number;
  pageSize: number;
}

const RowNumberCell: React.FC<RowNumberCellProps> = ({ value, page, pageSize }) => (
  <div>{page * pageSize + value + 1}</div>
);

// A wrapper around RowNumberCell to use as a Cell renderer
const createRowNumberRenderer = (page: number, pageSize: number) => {
  const CellRenderer = ({ row }: { row: { index: number } }) => (
    <RowNumberCell value={row.index} page={page} pageSize={pageSize} />
  );

  return CellRenderer;
};

// Interface for column filters
interface ColumnFilter {
  column: string;
  value: string;
}

// Add a context to track the active input field
const FocusContext = createContext<{
  activeColumn: string | null;
  setActiveColumn: (column: string | null) => void;
}>({
  activeColumn: null,
  // This is just a placeholder, will be overridden by the actual implementation
  setActiveColumn: () => {
    /* empty function */
  },
});

// Updated FilterInput component to maintain focus
const FilterInput = ({
  column,
  currentValue,
  onFilterChange,
}: {
  column: string;
  currentValue: string;
  onFilterChange: (column: string, value: string) => void;
}) => {
  const [value, setValue] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const { activeColumn, setActiveColumn } = useContext(FocusContext);

  // Update internal state when prop changes
  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  // Restore focus if this input was active
  useEffect(() => {
    if (activeColumn === column && inputRef.current) {
      inputRef.current.focus();

      // Place cursor at the end of input
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [activeColumn, column, value]);

  // Debounce the filter change to prevent too many requests
  const debouncedChange = useCallback(
    _.debounce((newValue: string) => {
      onFilterChange(column, newValue);
    }, 500),
    [column, onFilterChange],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedChange(newValue);
  };

  const handleFocus = () => {
    setActiveColumn(column);
  };

  const handleBlur = () => {
    // Only clear active column if we're the active one
    if (activeColumn === column) {
      setActiveColumn(null);
    }
  };

  return (
    <InputGroup size="sm" className="mt-1">
      <Input
        innerRef={inputRef}
        placeholder="Filter..."
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </InputGroup>
  );
};

// Updated factory function to pass the current filter value
const createFilterComponent = (
  column: string,
  currentValue: string,
  onFilterChange: (column: string, value: string) => void,
) => {
  const FilterComponent = () => (
    <FilterInput column={column} currentValue={currentValue} onFilterChange={onFilterChange} />
  );
  return FilterComponent;
};

const TableView: React.FC<TableViewProps> = ({ tableId }) => {
  const dispatch = useAppDispatch();
  const { tables, tableData, loading, error, rowCount, countLoading, countError } = useAppSelector(
    (state) => state.tableView,
  );
  const activeTable = tables.find((table) => table.id === tableId);

  // Add pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Add filters state
  const [filters, setFilters] = useState<ColumnFilter[]>([]);

  // Add state to track which column's input is focused - moved to top with other state
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  // Create a stable context value with useMemo
  const focusContextValue = useMemo(
    () => ({
      activeColumn,
      setActiveColumn,
    }),
    [activeColumn],
  );

  // Use a ref to track filters for data fetching
  const filtersRef = React.useRef<ColumnFilter[]>([]);

  // Track if we need to fetch data
  const shouldFetchRef = React.useRef<boolean>(false);
  const currentPageRef = React.useRef<number>(0);

  // Connection details from host reducer
  const connectionDetails = useAppSelector((state) => ({
    database: state.host.database,
    user: state.host.user,
    password: state.host.password,
  }));

  // Detect column types (number, string, etc.)
  const columnTypes = useMemo(() => {
    if (!tableData || !tableData.rows || tableData.rows.length === 0) return {};

    const types: Record<string, string> = {};

    tableData.fields.forEach((field: any) => {
      if (!tableData.rows[0]) return;

      const value = tableData.rows[0][field.name];

      if (typeof value === 'number') {
        types[field.name] = 'number';
      } else if (typeof value === 'boolean') {
        types[field.name] = 'boolean';
      } else {
        types[field.name] = 'string';
      }
    });

    return types;
  }, [tableData]);

  // Basic function to build WHERE clause
  const buildWhereClause = (currentFilters: ColumnFilter[]) => {
    const validFilters = currentFilters.filter((f) => f.value.trim() !== '');

    if (validFilters.length === 0) return '';

    const conditions = validFilters
      .map((filter) => {
        const columnName = filter.column;
        const value = filter.value.trim();
        const type = columnTypes[columnName] || 'string';

        if (type === 'number') {
          // For numbers, use exact match if it's a valid number
          const numValue = parseFloat(value);
          if (!Number.isNaN(numValue)) {
            return `"${columnName}" = ${numValue}`;
          }
          return '';
        }

        if (type === 'boolean') {
          // For booleans, check for true/false
          if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            return `"${columnName}" = ${value.toLowerCase()}`;
          }
          return '';
        }

        // For strings, use case-insensitive LIKE
        return `"${columnName}"::text ILIKE '%${value.replace(/'/g, "''")}%'`;
      })
      .filter((condition) => condition !== '');

    return conditions.length > 0 ? conditions.join(' AND ') : '';
  };

  // Fetch data without dependencies
  const fetchData = useCallback(() => {
    if (!activeTable) return;

    const currentFilters = filtersRef.current;
    const currentPage = currentPageRef.current;
    const whereClause = buildWhereClause(currentFilters);

    // Fetch count
    if (whereClause) {
      dispatch(fetchTableCount(activeTable.table_name, activeTable.table_schema, connectionDetails, whereClause));
    } else {
      dispatch(fetchTableCount(activeTable.table_name, activeTable.table_schema, connectionDetails));
    }

    // Fetch data
    dispatch(
      fetchTableData(
        activeTable.table_name,
        activeTable.table_schema,
        connectionDetails,
        currentPage,
        pageSize,
        whereClause,
      ),
    );

    // Reset the flag
    shouldFetchRef.current = false;
  }, [activeTable, dispatch, connectionDetails, pageSize]);

  // Check if we need to fetch data (separate useEffect to avoid infinite loop)
  useEffect(() => {
    if (shouldFetchRef.current) {
      fetchData();
    }
  });

  // Initial data loading
  useEffect(() => {
    if (activeTable) {
      // Reset to first page
      setPage(0);
      currentPageRef.current = 0;

      // Clear filters
      setFilters([]);
      filtersRef.current = [];

      // Set flag to fetch data
      shouldFetchRef.current = true;
    }
  }, [activeTable, dispatch]);

  // Handle filter changes
  const handleFilterChange = useCallback((column: string, value: string) => {
    // Update filters state
    setFilters((prevFilters) => {
      // Check if we already have a filter for this column
      const existingIndex = prevFilters.findIndex((f) => f.column === column);
      let newFilters: ColumnFilter[];

      if (existingIndex >= 0) {
        // Update existing filter
        newFilters = [...prevFilters];

        if (value === '') {
          // Remove filter if value is empty
          newFilters.splice(existingIndex, 1);
        } else {
          // Update filter value
          newFilters[existingIndex] = { column, value };
        }
      } else if (value !== '') {
        // Add new filter
        newFilters = [...prevFilters, { column, value }];
      } else {
        // No changes
        return prevFilters;
      }

      // Update refs and set fetch flag
      filtersRef.current = newFilters;
      currentPageRef.current = 0; // Reset to first page
      shouldFetchRef.current = true;

      return newFilters;
    });

    // Also update page state (but not directly triggering a fetch)
    setPage(0);
  }, []);

  // Handlers for pagination
  const handlePreviousPage = () => {
    if (page > 0) {
      const newPage = page - 1;
      setPage(newPage);
      currentPageRef.current = newPage;
      shouldFetchRef.current = true;
    }
  };

  const handleNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    currentPageRef.current = newPage;
    shouldFetchRef.current = true;
  };

  // Clear filters handler
  const handleClearFilters = () => {
    setFilters([]);
    filtersRef.current = [];
    setPage(0);
    currentPageRef.current = 0;
    shouldFetchRef.current = true;
  };

  // Function to calculate total pages
  const getTotalPages = () => {
    if (!rowCount) return 0;
    return Math.ceil(rowCount / pageSize);
  };

  const parseRows = () => {
    if (!tableData || !tableData.rows) return [];

    const parsedRows: any[] = [];
    const rows = _.cloneDeep(tableData.rows);

    rows.forEach((row: any) => {
      const tableRow = row;

      tableData.fields.forEach((field: any) => {
        if (_.isObject(tableRow[field.name]) || typeof tableRow[field.name] === 'boolean') {
          tableRow[field.name] = JSON.stringify(tableRow[field.name]);
        }
      });

      parsedRows.push(tableRow);
    });

    return parsedRows;
  };

  // Create the cell renderer once
  const rowNumberRenderer = useMemo(() => createRowNumberRenderer(page, pageSize), [page, pageSize]);

  // Create filter components for each column - update to pass current filter values
  const columns = useMemo(() => {
    if (!tableData || !tableData.fields) return [];

    const cols: any[] = [
      {
        Header: '#',
        id: 'row',
        maxWidth: 50,
        disableFilters: true,
        Cell: rowNumberRenderer,
      },
    ];

    tableData.fields.forEach((field: any) => {
      // Get current filter value for this column
      const currentFilter = filters.find((f) => f.column === field.name);
      const currentValue = currentFilter ? currentFilter.value : '';

      // Create filter component for this field
      const FilterComponent = createFilterComponent(field.name, currentValue, handleFilterChange);

      cols.push({
        Header: field.name,
        accessor: field.name,
        Filter: FilterComponent,
      });
    });

    return cols;
  }, [tableData, rowNumberRenderer, handleFilterChange, filters]); // Add filters to dependencies

  // Create table instance
  const data = useMemo(() => parseRows(), [tableData]);

  const tableInstance = useTable({
    columns,
    data,
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = tableInstance;

  // Retry fetching data
  const handleRetry = () => {
    if (activeTable) {
      // Reset to first page
      setPage(0);
      currentPageRef.current = 0;

      // Try with smaller page size
      const newPageSize = Math.max(5, Math.floor(pageSize / 2));
      setPageSize(newPageSize);

      // Set flag to fetch data
      shouldFetchRef.current = true;
    }
  };

  // Loading state
  if (loading && !tableData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <span className="ml-3">Loading table data...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    // No need to parse JSON as we're now handling serialized errors
    return (
      <div className="result">
        <Alert color="danger">
          <h4>Error loading table data</h4>
          <div className="mt-3">
            <p>
              <strong>Error:</strong> {error.message || 'Unknown error'}
            </p>
            {error.status && (
              <p>
                <strong>Status:</strong> {error.status} {error.statusText}
              </p>
            )}
            {error.code && (
              <p>
                <strong>Code:</strong> {error.code}
              </p>
            )}
          </div>
          <div className="mt-3">
            <Button color="primary" onClick={handleRetry}>
              Retry with smaller page size
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // No data state
  if (!tableData) {
    return <div>No data available</div>;
  }

  const totalPages = getTotalPages();

  return (
    <FocusContext.Provider value={focusContextValue}>
      <div className="result">
        {activeTable && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{`${activeTable.table_schema}.${activeTable.table_name}`}</h4>
            {rowCount !== null && (
              <Badge color="info" pill className="p-2">
                <span style={{ fontSize: '1rem' }}>Total: {rowCount} rows</span>
              </Badge>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <span>
              Page: {page + 1} {totalPages > 0 && `of ${totalPages}`}
            </span>
            <span className="ml-3">Showing {rows.length} rows per page</span>
            {filters.length > 0 && (
              <span className="ml-3">
                <Badge color="primary" pill>
                  Filters: {filters.length}
                </Badge>
              </span>
            )}
          </div>
          <ButtonGroup>
            <Button color="secondary" onClick={handlePreviousPage} disabled={page === 0}>
              Previous
            </Button>
            <Button
              color="secondary"
              onClick={handleNextPage}
              disabled={rows.length < pageSize || (rowCount !== null && (page + 1) * pageSize >= rowCount)}
            >
              Next
            </Button>
            {filters.length > 0 && (
              <Button color="danger" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </ButtonGroup>
        </div>

        <div className="table-responsive">
          <table {...getTableProps()} className="table table-striped table-hover">
            <thead>
              {headerGroups.map((headerGroup: any) => (
                <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column: any) => (
                    <th {...column.getHeaderProps()} key={column.id}>
                      {column.render('Header')}
                      {column.id !== 'row' && column.render('Filter')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row: any) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map((cell: any) => (
                      <td {...cell.getCellProps()} key={cell.column.id}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headerGroups[0]?.headers.length || 1} className="text-center p-3">
                    No records found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default TableView;

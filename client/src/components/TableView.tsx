import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import { useTable, Column } from 'react-table';
import _ from 'lodash';
import { Button, ButtonGroup, Alert, Badge } from 'reactstrap';
import { useAppSelector, useAppDispatch } from '../hooks';
import { fetchTableData, fetchTableCount } from '../actions/tableViewActions';

// Add this for TypeScript to recognize react-table
declare module 'react-table' {}

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
const RowNumberCellWrapper = (page: number, pageSize: number) => {
  const CellRenderer = ({ row }: { row: { index: number } }) => (
    <RowNumberCell value={row.index} page={page} pageSize={pageSize} />
  );

  return CellRenderer;
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

  // Create the cell renderer once
  const rowNumberRenderer = useMemo(() => RowNumberCellWrapper(page, pageSize), [page, pageSize]);

  // Connection details from host reducer
  const connectionDetails = useAppSelector((state) => ({
    database: state.host.database,
    user: state.host.user,
    password: state.host.password,
  }));

  useEffect(() => {
    if (activeTable) {
      // Reset to first page when table changes
      setPage(0);

      // Fetch the count of rows
      dispatch(fetchTableCount(activeTable.table_name, activeTable.table_schema, connectionDetails));

      // Fetch the first page of data
      fetchData(0);
    }
  }, [dispatch, activeTable]);

  // Function to fetch data with current pagination
  const fetchData = (currentPage: number) => {
    if (activeTable) {
      dispatch(
        fetchTableData(activeTable.table_name, activeTable.table_schema, connectionDetails, currentPage, pageSize),
      );
    }
  };

  // Handlers for pagination
  const handlePreviousPage = () => {
    if (page > 0) {
      const newPage = page - 1;
      setPage(newPage);
      fetchData(newPage);
    }
  };

  const handleNextPage = () => {
    const newPage = page + 1;
    setPage(newPage);
    fetchData(newPage);
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
      cols.push({
        Header: field.name,
        accessor: field.name,
      });
    });

    return cols;
  }, [tableData, rowNumberRenderer]);

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

      // Try with smaller page size
      const newPageSize = Math.max(5, Math.floor(pageSize / 2));
      setPageSize(newPageSize);

      // Retry fetching
      dispatch(fetchTableCount(activeTable.table_name, activeTable.table_schema, connectionDetails));
      dispatch(fetchTableData(activeTable.table_name, activeTable.table_schema, connectionDetails, 0, newPageSize));
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableView;

import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { useTable, usePagination } from 'react-table';
import * as PropTypes from 'prop-types';

// Define the row number cell component outside the main component
const RowNumberCell = ({ index }) => <div>{index + 1}</div>;

RowNumberCell.propTypes = {
  index: PropTypes.number.isRequired,
};

// Cell renderer for row numbers - defined outside component
const CellRenderer = ({ row }) => <RowNumberCell index={row.index} />;

CellRenderer.propTypes = {
  row: PropTypes.shape({
    index: PropTypes.number.isRequired,
  }).isRequired,
};

export const ResultTable = (props) => {
  // Use useMemo to cache the parsed rows and columns to avoid recalculation on every render
  const parsedRows = useMemo(() => {
    if (!props.result || !props.result.rows) return [];

    // Don't clone the entire result set - process rows individually
    return props.result.rows.map((row) => {
      // Create a new object instead of mutating the original
      const tableRow = {};

      props.result.fields.forEach((field) => {
        const value = row[field.name];
        if (value === null || value === undefined) {
          tableRow[field.name] = '';
        } else if (typeof value === 'object' || typeof value === 'boolean') {
          tableRow[field.name] = JSON.stringify(value);
        } else {
          tableRow[field.name] = value;
        }
      });

      return tableRow;
    });
  }, [props.result]);

  const columns = useMemo(() => {
    if (!props.result || !props.result.fields) return [];

    const cols = [
      {
        Header: '#',
        id: 'row',
        maxWidth: 50,
        disableFilters: true,
        Cell: CellRenderer,
      },
    ];

    props.result.fields.forEach((field) => {
      cols.push({
        Header: field.name,
        accessor: field.name,
      });
    });

    return cols;
  }, [props.result]);

  const defaultPageSize = 20;

  // Set up React Table with the useTable hook
  const tableInstance = useTable(
    {
      columns,
      data: parsedRows,
      initialState: { pageSize: defaultPageSize },
    },
    usePagination,
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    nextPage,
    previousPage,
    state: { pageIndex },
  } = tableInstance;

  let { error } = props;

  if (props.error && props.error.request && props.error.request.response) {
    error = JSON.parse(props.error.request.response);
  }

  // Check if we have a large result set that's been limited
  const hasLimitedResults = props.result && props.result.hasMoreRows;
  const fullRowCount = props.result?.fullRowCount;

  return (
    <div className="result">
      {props.result && (
        <>
          {hasLimitedResults && (
            <div className="alert alert-info mb-3" role="alert">
              <strong>Note:</strong> Showing {props.result.rows.length} of {fullRowCount || 'many'} rows for better
              performance. You can modify your query to include a LIMIT clause for more specific results.
            </div>
          )}

          <div className="table-responsive">
            <table {...getTableProps()} className="table table-striped table-hover">
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()} key={column.id}>
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} key={row.id}>
                      {row.cells.map((cell) => (
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

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="pagination d-flex justify-content-between align-items-center mt-3">
              <div>
                <button
                  type="button"
                  onClick={() => previousPage()}
                  disabled={!canPreviousPage}
                  className="btn btn-sm btn-outline-secondary mr-2"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => nextPage()}
                  disabled={!canNextPage}
                  className="btn btn-sm btn-outline-secondary"
                >
                  Next
                </button>
              </div>
              <span>
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>
              </span>
            </div>
          )}
        </>
      )}
      {props.error && (
        <div>
          {`ERROR: ${error.message}`}
          <div className="w-100" />
          {`CODE: ${error.code}`}
          <div className="w-100" />
          {`POSITION: ${error.position}`}
        </div>
      )}
    </div>
  );
};

ResultTable.propTypes = {
  result: PropTypes.shape({
    rows: PropTypes.arrayOf(PropTypes.shape({})),
    fields: PropTypes.arrayOf(PropTypes.shape({})),
    rowCount: PropTypes.number,
    fullRowCount: PropTypes.number,
    hasMoreRows: PropTypes.bool,
  }),
  error: PropTypes.shape({
    message: PropTypes.string,
    code: PropTypes.string,
    position: PropTypes.string,
    request: PropTypes.shape({
      response: PropTypes.string,
    }),
  }),
};

const mapStateToProps = (store) => ({
  result: store.query.result,
  error: store.query.error,
});

export default connect(mapStateToProps)(ResultTable);

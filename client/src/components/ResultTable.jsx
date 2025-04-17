import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import * as PropTypes from 'prop-types';

// Define the row number cell component outside the main component
const RowNumberCell = ({ index }) => <div>{index + 1}</div>;

RowNumberCell.propTypes = {
  index: PropTypes.number.isRequired,
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
        filterable: false,
        resizable: false,
        Cell: RowNumberCell,
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

  let { error } = props;

  if (props.error && props.error.request && props.error.request.response) {
    error = JSON.parse(props.error.request.response);
  }

  const defaultPageSize = 20;

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
          <ReactTable
            className="-striped -highlight"
            data={parsedRows}
            columns={columns}
            minRows={0}
            defaultPageSize={defaultPageSize}
            showPagination={parsedRows.length > defaultPageSize}
            // Add these performance optimizations
            loading={false}
            resolveData={(data) => data}
            multiSort={false}
            // Only load rows for current page
            pageSize={defaultPageSize}
          />
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

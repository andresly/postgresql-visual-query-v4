import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Button, Input } from 'reactstrap';
import { removeColumn, updateColumn } from '../actions/queryActions';
import { translations } from '../utils/translations';
import { bannedWords } from '../utils/bannedWords';

const QueryCreationTableColumn = ({ data, id, index }) => {
  const dispatch = useDispatch();
  const { distinct, language, queries, columns } = useSelector((store) => ({
    distinct: store.query.distinct,
    language: store.settings.language,
    queries: store.queries.filter((query) => query.id !== 0).sort((query1, query2) => query1.id - query2.id),
    columns: store.query.columns,
  }));
  const maxConditions = Math.max(...columns.map((col) => col.column_conditions.length), data.column_conditions.length);
  const [filterValid, setFilterValid] = useState(true);

  const [columnData, setColumnData] = useState({
    column_alias: data.column_alias,
    filter_valid: true,
    column_name: data.column_name,
  });

  const scalarFunctions = process.env.REACT_APP_SCALAR_FUNCTIONS.split(',');
  const singleLineFunctions = process.env.REACT_APP_SINGE_LINE_FUNCTIONS.split(',');

  const [conditionsData, setConditionsData] = useState(data.column_conditions);

  const updateFilterValue = (index, value) => {
    setConditionsData((prevConditionsData) => {
      const newConditionsData = [...prevConditionsData];
      newConditionsData[index] = value;
      return newConditionsData;
    });
  };

  const changeColumnOrder = (e) => {
    let column = _.cloneDeep(data);
    const isOrdering = e.target.value !== '';

    column = {
      ...column,
      column_order: isOrdering,
      column_order_dir: e.target.value === 'ASC',
    };

    dispatch(updateColumn(column));
  };

  const handleSwitch = (e) => {
    let column = _.cloneDeep(data);
    column = {
      ...column,
      [e.target.name]: !column[e.target.name],
    };
    dispatch(updateColumn(column));
  };

  const handleFilterChange = (index) => {
    console.log('siin');
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

  const handleOnChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setColumnData((prevColumnData) => {
      console.log({ prevColumnData });
      const newData = {
        ...prevColumnData,
        [name]: value,
      };
      console.log({ newData });
      return {
        ...prevColumnData,
        [name]: value,
      };
    });
  };

  const handleOnSave = (e) => {
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

      setColumnData((prevColumnData) => ({
        ...prevColumnData,
        column_alias: column.column_alias,
      }));
    }

    console.log('alias', column.column_alias);
    // remove double quotes from column_alias
    column.column_alias = column.column_alias.replace(/"/g, '');
    console.log('alias2', column.column_alias);

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
              {/* {data.column_name} */}
              <Input
                type="text"
                name={`column_name`}
                id={`column-name-${data.id}`}
                onBlur={(e) => handleOnSave(e)}
                onChange={(e) => handleOnChange(e)}
                value={columnData.column_name}
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
                onBlur={(e) => handleOnSave(e)}
                onChange={(e) => handleOnChange(e)}
                value={columnData.column_alias}
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
                <Input
                  type="textarea"
                  rows={1}
                  name={`column_filter_${data.id}_${index}`}
                  id={`column-filter-${data.id}-${index}`}
                  className={filterValid ? '' : 'is-invalid'}
                  onBlur={() => handleFilterChange(index)}
                  onChange={(e) => updateFilterValue(index, e.target.value)}
                  value={conditionsData[index] || ''}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </td>
  );
};

QueryCreationTableColumn.propTypes = {
  data: PropTypes.shape({
    column: PropTypes.string,
    table: PropTypes.string,
    aggregate: PropTypes.string,
    sort: PropTypes.string,
    show: PropTypes.bool,
    removeDuplicates: PropTypes.bool,
    criteria: PropTypes.string,
    or1: PropTypes.string,
    or2: PropTypes.string,
  }),
};

export default QueryCreationTableColumn;

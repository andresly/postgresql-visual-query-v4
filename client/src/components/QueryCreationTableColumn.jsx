import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { Input } from 'reactstrap';
import { updateColumn } from '../actions/queryActions';
import { translations } from '../utils/translations';
import { bannedWords } from '../utils/bannedWords';

const QueryCreationTableColumn = ({ data, id, index }) => {
  const dispatch = useDispatch();

  const { distinct, language, queries } = useSelector((store) => ({
    distinct: store.query.distinct,
    language: store.settings.language,
    queries: store.queries.filter((query) => query.id !== 0).sort((query1, query2) => query1.id - query2.id),
  }));

  const [filterValid, setFilterValid] = useState(true);

  const [columnData, setColumnData] = useState({
    column_alias: data.column_alias,
    column_filter: data.column_filter,
    filter_valid: true,
  });

  const changeColumnOrder = (e) => {
    let column = _.cloneDeep(data);
    column = {
      ...column,
      column_order: e.target.value !== '',
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

  const handleChange = (e) => {
    console.log('name', e.target.name);
    console.log('value', e.target.value);
    setColumnData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = (e) => {
    let column = _.cloneDeep(data);

    if (e.currentTarget.name === 'subqueryDefault') {
      column = {
        ...column,
        subqueryId: 0,
        subquerySql: '',
      };
    }

    if (e.currentTarget.name === 'subqueryId') {
      const subqueryId = +e.target.value;
      const subquerySql = queries.find((query) => query.id === subqueryId).sql;

      column = {
        ...column,
        subqueryId,
        subquerySql,
      };
    } else {
      column = {
        ...column,
        [e.target.name]: e.target.value,
      };
    }

    let contains = false;

    const filter = _.lowerCase(column.column_filter).split(' ');

    bannedWords.forEach((el) => {
      if (filter.includes(el)) {
        contains = true;
      }
    });

    if (contains) {
      setFilterValid(false);
    } else {
      setFilterValid(true);

      updateColumn(column);
    }
  };

  console.log({ data });
  return (
    <td>
      <table>
        <tbody>
          <tr style={{ height: '56px' }}>
            <td className="p-2 text-center">{data.column_name}</td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2 text-center">{data.table_name}</td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <select className="form-control">
                <option value="">Select function</option>
                <option value="AVG">AVG</option>
                <option value="BIT_AND">BIT_AND</option>
                <option value="BIT_OR">BIT_OR</option>
                <option value="BOOL_AND">BOOL_AND</option>
                <option value="BOOL_OR">BOOL_OR</option>
                <option value="COUNT">COUNT</option>
                <option value="MAX">MAX</option>
                <option value="MIN">MIN</option>
                <option value="SUM">SUM</option>
                <option value="ASCII">ASCII</option>
                <option value="BIT_LENGTH">BIT_LENGTH</option>
                <option value="CHAR_LENGTH">CHAR_LENGTH</option>
                <option value="INITCAP">INITCAP</option>
                <option value="LENGTH">LENGTH</option>
                <option value="LOWER">LOWER</option>
                <option value="OCTET_LENGTH">OCTET_LENGTH</option>
                <option value="REVERSE">REVERSE</option>
                <option value="UPPER">UPPER</option>
                <option value="TO_ASCII">TO_ASCII</option>
                <option value="TO_HEX">TO_HEX</option>
              </select>
            </td>
          </tr>
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <select className="form-control" onChange={changeColumnOrder}>
                <option selected={!data.column_order} value="">
                  Select function
                </option>
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
          <tr style={{ height: '56px' }}>
            <td className="p-2">
              <Input
                type="text-dark"
                name="column_filter"
                id={`column-filter-${data.id}`}
                className={filterValid ? '' : 'is-invalid'}
                onBlur={(e) => handleSave(e)}
                onChange={(e) => handleChange(e)}
                value={columnData.column_filter}
                placeholder={translations[language.code].queryBuilder.filterPh}
              />
              {/*<input type="text" className="form-control" defaultValue={data.criteria} />*/}
            </td>
          </tr>
          {/*<tr style={{ height: '56px' }}>*/}
          {/*  <td className="p-2">*/}
          {/*    <input type="text" className="form-control" defaultValue={data.or1} />*/}
          {/*  </td>*/}
          {/*</tr>*/}
          {/*<tr style={{ height: '56px' }}>*/}
          {/*  <td className="p-2">*/}
          {/*    <input type="text" className="form-control" defaultValue={data.or2} />*/}
          {/*  </td>*/}
          {/*</tr>*/}
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

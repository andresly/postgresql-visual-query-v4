import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  ButtonDropdown,
  Card,
  CardBody,
  Container,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Row,
  UncontrolledTooltip,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { addColumn, removeColumn, updateColumn } from '../actions/queryActions';
import { translations } from '../utils/translations';
import { bannedWords } from '../utils/bannedWords';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';

const CopyButton = ({ id, handleCopy, languageCode }) => (
  <div>
    <Button size="sm" color="secondary" id={`${id}_copy`} className="mr-1" onClick={handleCopy}>
      <FontAwesomeIcon icon="copy" />
    </Button>
    <UncontrolledTooltip placement="top" target={`${id}_copy`} delay={{ show: 500, hide: 0 }}>
      {translations[languageCode].tooltips.copyColumn}
    </UncontrolledTooltip>
  </div>
);

CopyButton.propTypes = {
  id: PropTypes.string,
  handleCopy: PropTypes.func,
  languageCode: PropTypes.string,
};

const RemoveButton = ({ id, handleRemoveColumn }) => (
  <div>
    <Button size="sm" color="danger" id={`${id}_remove`} onClick={handleRemoveColumn}>
      <FontAwesomeIcon icon="times" />
    </Button>
  </div>
);

RemoveButton.propTypes = {
  id: PropTypes.string,
  handleRemoveColumn: PropTypes.func,
};

const QueryColumn = ({ data, removeColumn, addColumn, updateColumn, id, index, distinct, language, queries }) => {
  const [state, setState] = useState({
    column_alias: data.column_alias,
    column_filter: data.column_filter,
    filter_valid: true,
    dropDownOpen: false,
  });

  useEffect(() => {
    if (data.subqueryId) {
      let column = _.cloneDeep(data);

      const subquery = queries.find((query) => query.id === data.subqueryId);
      const subquerySql = subquery ? subquery.sql : '';

      column = {
        ...column,
        subquerySql,
      };

      updateColumn(column);
    }
  }, [data.subqueryId, queries, data, updateColumn]);

  const handleDropDown = () => {
    setState((prevState) => ({
      ...prevState,
      dropDownOpen: !prevState.dropDownOpen,
    }));
  };

  const handleRemoveColumn = () => {
    removeColumn(data);
  };

  const handleChange = (e) => {
    setState((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCopy = () => {
    addColumn(data);
  };

  const handleRemove = (e) => {
    const updatedState = {
      ...state,
      [e.currentTarget.name]: '',
    };

    setState(updatedState);

    let column = _.cloneDeep(data);

    column = {
      ...column,
      [e.currentTarget.name]: '',
    };

    if (_.isEqual(e.target.name, 'column_filter')) {
      setState((prevState) => ({
        ...prevState,
        filter_valid: true,
      }));
    }

    updateColumn(column);
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
      setState((prevState) => ({
        ...prevState,
        filter_valid: false,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        filter_valid: true,
      }));
      updateColumn(column);
    }
  };

  const handleSwitch = (e) => {
    let column = _.cloneDeep(data);

    column = {
      ...column,
      [e.target.name]: !column[e.target.name],
    };

    updateColumn(column);
  };

  const orderDirection = data.column_order_dir
    ? translations[language.code].queryBuilder.ascL
    : translations[language.code].queryBuilder.descL;

  const columnOrderVisibility = data.column_order ? 'visible' : 'invisible';
  const columnName = _.isEmpty(data.table_alias)
    ? `${data.table_schema}.${data.table_name}.${data.column_name}`
    : `${data.table_schema}.${data.table_alias}.${data.column_name}`;

  const filterValid = state.filter_valid ? '' : 'is-invalid';
  const linkedQuery = queries.find((query) => query.id === data.subqueryId);
  const linkedQueryName = linkedQuery
    ? getCorrectQueryName(language, linkedQuery.queryName, linkedQuery.id)
    : translations[language.code].queryBuilder.linkSq;

  return (
    <Draggable draggableId={`${id}`} index={index}>
      {(provided) => (
        <div className="m-auto">
          <Card
            className="px-0 my-2"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <CardBody className="mx-0 pr-2 pl-1 pt-1 pb-1">
              <Form inline className="align-content-center">
                <Container fluid className="pr-0">
                  <Row form>
                    <div className="col-auto pl-0 pr-3 d-flex align-items-center">
                      <FontAwesomeIcon className="" icon="sort" />
                    </div>
                    <div className="col-10 p-0">{/* Column content omitted for brevity */}</div>
                  </Row>
                </Container>
              </Form>
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

QueryColumn.propTypes = {
  data: PropTypes.shape({
    column_alias: PropTypes.string,
    column_filter: PropTypes.string,
    column_order_dir: PropTypes.bool,
    column_order: PropTypes.bool,
    table_alias: PropTypes.string,
    table_name: PropTypes.string,
    column_name: PropTypes.string,
    id: PropTypes.number,
    display_in_query: PropTypes.bool,
    table_schema: PropTypes.string,
    data_type: PropTypes.string,
    column_distinct_on: PropTypes.bool,
    column_group_by: PropTypes.bool,
    column_aggregate: PropTypes.string,
    subqueryId: PropTypes.number,
    filter_as_having: PropTypes.bool,
  }),
  removeColumn: PropTypes.func,
  addColumn: PropTypes.func,
  updateColumn: PropTypes.func,
  id: PropTypes.string,
  index: PropTypes.number,
  distinct: PropTypes.bool,
  language: PropTypes.shape({ code: PropTypes.string }),
  queries: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (store) => ({
  distinct: store.query.distinct,
  language: store.settings.language,
  queries: store.queries.filter((query) => query.id !== 0).sort((query1, query2) => query1.id - query2.id),
});

const mapDispatchToProps = {
  updateColumn,
  removeColumn,
  addColumn,
};

export default connect(mapStateToProps, mapDispatchToProps)(QueryColumn);

import React, { useState } from 'react';
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
import { addColumn, removeColumn, updateColumn } from '../actions/queryActions';
import { translations } from '../utils/translations';
import { bannedWords } from '../utils/bannedWords';
import { getCorrectQueryName } from '../utils/getCorrectQueryName';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryColumnType } from '../types/queryTypes';
import { LanguageType } from '../types/settingsType';

interface CopyButtonProps {
  id: string;
  handleCopy: () => void;
  language: LanguageType;
}

const CopyButton: React.FC<CopyButtonProps> = ({ id, handleCopy, language }) => (
  <div>
    <Button size="sm" color="secondary" id={`${id}_copy`} className="mr-1" onClick={handleCopy}>
      <FontAwesomeIcon icon="copy" />
    </Button>
    <UncontrolledTooltip placement="top" target={`${id}_copy`} delay={{ show: 500, hide: 0 }}>
      {translations[language.code].tooltips.copyColumn}
    </UncontrolledTooltip>
  </div>
);

interface RemoveButtonProps {
  id: string;
  handleRemoveColumn: () => void;
}

const RemoveButton: React.FC<RemoveButtonProps> = ({ id, handleRemoveColumn }) => (
  <div>
    <Button size="sm" color="danger" id={`${id}_remove`} onClick={handleRemoveColumn}>
      <FontAwesomeIcon icon="times" />
    </Button>
  </div>
);

interface QueryColumnProps {
  data: QueryColumnType;
  id: string;
  index: number;
}

export const QueryColumn: React.FC<QueryColumnProps> = ({ data, id, index }) => {
  const dispatch = useAppDispatch();

  const distinct = useAppSelector((state) => state.query.distinct);
  const language = useAppSelector((state) => state.settings.language);
  const queries = useAppSelector((state) =>
    state.queries.filter((query) => query.id !== 0).sort((query1, query2) => query1.id - query2.id),
  );

  const [column_alias, setColumnAlias] = useState(data.column_alias);
  const [column_filter, setColumnFilter] = useState(data.column_filter);
  const [filter_valid, setFilterValid] = useState(true);
  const [dropDownOpen, setDropDownOpen] = useState(false);

  const handleDropDown = () => {
    setDropDownOpen(!dropDownOpen);
  };

  const handleRemoveColumn = () => {
    dispatch(removeColumn(data));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'column_alias') {
      setColumnAlias(value);
    } else if (name === 'column_filter') {
      setColumnFilter(value);
    }
  };

  const handleCopy = () => {
    dispatch(addColumn(data));
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const name = e.currentTarget.name as 'column_alias' | 'column_filter';

    if (name === 'column_alias') {
      setColumnAlias('');
    } else if (name === 'column_filter') {
      setColumnFilter('');
      setFilterValid(true);
    }

    let column = _.cloneDeep(data);
    column = {
      ...column,
      [name]: '',
    };

    dispatch(updateColumn(column));
  };

  const handleSave = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | React.MouseEvent<HTMLElement>) => {
    let column = _.cloneDeep(data);

    const target = e.currentTarget as HTMLElement & { name?: string; value?: string };

    if (target.name === 'subqueryDefault') {
      column = {
        ...column,
        subqueryId: 0,
        subquerySql: '',
      };
    } else if (target.name === 'subqueryId') {
      const subqueryId = +(target.value || '0');
      const subquery = queries.find((query) => query.id === subqueryId);
      const subquerySql = subquery ? subquery.sql : '';

      column = {
        ...column,
        subqueryId,
        subquerySql,
      };
    } else if (target.name) {
      column = {
        ...column,
        [target.name]: target.value,
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
      dispatch(updateColumn(column));
    }
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    let column = _.cloneDeep(data);

    column = {
      ...column,
      [e.target.name]: !column[e.target.name as keyof typeof column],
    };

    dispatch(updateColumn(column));
  };

  const orderDirection = data.column_order_dir
    ? translations[language.code].queryBuilder.ascL
    : translations[language.code].queryBuilder.descL;
  const columnOrderVisibility = data.column_order ? 'visible' : 'invisible';
  const columnName = _.isEmpty(data.table_alias)
    ? `${data.table_schema}.${data.table_name}.${data.column_name}`
    : `${data.table_schema}.${data.table_alias}.${data.column_name}`;
  const filterValidClass = filter_valid ? '' : 'is-invalid';
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
            innerRef={provided.innerRef}
          >
            <CardBody className="mx-0 pr-2 pl-1 pt-1 pb-1">
              <Form inline className="align-content-center">
                <Container fluid className="pr-0">
                  <Row>
                    <div className="col-auto pl-0 pr-3 d-flex align-items-center">
                      <FontAwesomeIcon className="" icon="sort" />
                    </div>
                    <div className="col-10 p-0">
                      <Row>
                        <div className="col-auto d-flex">
                          <CustomInput
                            className=""
                            type="checkbox"
                            id={`display-${data.id}`}
                            name="display_in_query"
                            checked={data.display_in_query}
                            onChange={handleSwitch}
                          />
                          <h6 className="m-0 mr-2 align-self-center" id="column_name">
                            {columnName}
                          </h6>
                          <UncontrolledTooltip placement="top" delay={{ show: 0, hide: 0 }} target="column_name">
                            {data.data_type}
                          </UncontrolledTooltip>
                        </div>
                        <div className="col-auto">
                          <FormGroup>
                            <CustomInput
                              className="mr-2"
                              disabled={distinct}
                              type="switch"
                              id={`column-distinct-on-${data.id}`}
                              name="column_distinct_on"
                              checked={data.column_distinct_on}
                              onChange={handleSwitch}
                              label={translations[language.code].queryBuilder.distinctOnL}
                            />
                            <CustomInput
                              className="mr-2"
                              type="switch"
                              id={`column-group-by-${data.id}`}
                              name="column_group_by"
                              checked={data.column_group_by}
                              onChange={handleSwitch}
                              label={translations[language.code].queryBuilder.groupByL}
                            />
                            <CustomInput
                              className="mr-2"
                              type="switch"
                              id={`column-order-${data.id}`}
                              name="column_order"
                              checked={data.column_order}
                              onChange={handleSwitch}
                              label={translations[language.code].queryBuilder.orderL}
                            />
                            <CustomInput
                              className={columnOrderVisibility}
                              type="switch"
                              id={`column-order-dir-${data.id}`}
                              name="column_order_dir"
                              checked={data.column_order_dir}
                              onChange={handleSwitch}
                              label={orderDirection}
                            />
                          </FormGroup>
                        </div>
                      </Row>
                      <Row>
                        <div className="col-auto">
                          <CustomInput
                            bsSize="sm"
                            type="select"
                            name="column_aggregate"
                            id={`column-aggregate-${data.id}`}
                            className="my-1 align-self-start"
                            value={data.column_aggregate}
                            onChange={handleSave}
                          >
                            <option value="">{translations[language.code].queryBuilder.selectFunction}</option>
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
                          </CustomInput>
                        </div>
                        <div className="col-auto">
                          <InputGroup className="my-1 align-self-start" size="sm">
                            <Input
                              style={{ flexBasis: 'auto' }}
                              className="text-dark"
                              type="text"
                              name="column_alias"
                              id={`column-alias-${data.id}`}
                              onBlur={handleSave}
                              onChange={handleChange}
                              value={column_alias}
                              placeholder={translations[language.code].queryBuilder.aliasPh}
                            />
                            <UncontrolledTooltip
                              placement="top"
                              delay={{ show: 500, hide: 0 }}
                              target={`column-alias-${data.id}`}
                            >
                              {translations[language.code].tooltips.columnAlias}
                            </UncontrolledTooltip>
                            <InputGroupAddon addonType="append">
                              <Button
                                color="danger"
                                id={`column-alias-btn-${data.id}`}
                                name="column_alias"
                                onClick={handleRemove}
                              >
                                <FontAwesomeIcon icon="times" />
                              </Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                        <div className="col-auto" style={{ minWidth: '35%' }}>
                          <InputGroup className="my-1 align-self-start" size="sm">
                            <Input
                              type="text"
                              name="column_filter"
                              id={`column-filter-${data.id}`}
                              className={filterValidClass}
                              onBlur={handleSave}
                              onChange={handleChange}
                              value={column_filter}
                              placeholder={translations[language.code].queryBuilder.filterPh}
                            />
                            <div className="invalid-feedback order-1">
                              {translations[language.code].tooltips.invalidFilter}
                            </div>
                            <UncontrolledTooltip
                              placement="top"
                              delay={{ show: 500, hide: 0 }}
                              target={`column-filter-${data.id}`}
                            >
                              {translations[language.code].tooltips.columnFilter}
                            </UncontrolledTooltip>
                            <InputGroupAddon addonType="append">
                              <ButtonDropdown
                                isOpen={dropDownOpen}
                                toggle={handleDropDown}
                                id={`link-subquery-${data.id}`}
                              >
                                <DropdownToggle
                                  className="btn-sm btn-light btn-outline-secondary"
                                  style={{ borderColor: '#d3d8de' }}
                                  caret
                                >
                                  {linkedQueryName}
                                </DropdownToggle>
                                <DropdownMenu>
                                  <DropdownItem
                                    key="query-link-SQ"
                                    id={`subquery-default-${data.id}`}
                                    name="subqueryDefault"
                                    value=""
                                    onClick={handleSave}
                                  >
                                    {translations[language.code].queryBuilder.linkSq}
                                  </DropdownItem>
                                  {queries.map((query, idx) => (
                                    <DropdownItem
                                      key={`query-${query.id}-column-${data.id}`}
                                      id={`subquerySql-${idx}-${data.id}`}
                                      name="subqueryId"
                                      value={query.id}
                                      onClick={handleSave}
                                    >
                                      {getCorrectQueryName(language, query.queryName, query.id)}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </ButtonDropdown>
                              <UncontrolledTooltip
                                placement="top"
                                delay={{ show: 500, hide: 0 }}
                                target={`link-subquery-${data.id}`}
                              >
                                {translations[language.code].tooltips.linkSq}
                              </UncontrolledTooltip>
                            </InputGroupAddon>
                            <InputGroupAddon addonType="append">
                              <Button
                                color="danger"
                                id={`column-filter-btn-${data.id}`}
                                name="column_filter"
                                onClick={handleRemove}
                              >
                                <FontAwesomeIcon icon="times" />
                              </Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                        <div className="col-auto pt-2">
                          <CustomInput
                            className=""
                            type="switch"
                            id={`filter-as-having-${data.id}`}
                            name="filter_as_having"
                            checked={data.filter_as_having}
                            onChange={handleSwitch}
                            label={translations[language.code].queryBuilder.havingL}
                          />
                        </div>
                      </Row>
                    </div>
                    <div className="col d-flex w-100 ml-auto">
                      <FormGroup className="align-self-center justify-content-end m-0 ml-auto">
                        <CopyButton id={`copy-btn-${data.id}`} language={language} handleCopy={handleCopy} />
                        <RemoveButton id={`remove-btn-${data.id}`} handleRemoveColumn={handleRemoveColumn} />
                      </FormGroup>
                    </div>
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

// Connect component to Redux
export default QueryColumn;

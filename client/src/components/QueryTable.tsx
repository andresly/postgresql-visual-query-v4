import React, { useState, useEffect } from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Scrollbars } from 'react-custom-scrollbars';
import _ from 'lodash';
import { addTable, removeTable, resetQuery, removeJoin, updateJoin } from '../actions/queryActions';
import { translations } from '../utils/translations';
import QueryTablePopover from './QueryTablePopover';
import TableColumn from './TableColumn';
import { ArcherElement } from 'react-archer';
import { ReactComponent as LeftJoinIcon } from '../assets/icons/left-join.svg';
import { ReactComponent as RightJoinIcon } from '../assets/icons/right-join.svg';
import { ReactComponent as InnerJoinIcon } from '../assets/icons/inner-join.svg';
import { ReactComponent as OuterJoinIcon } from '../assets/icons/outer-join.svg';
import { ReactComponent as CorssJoinIcon } from '../assets/icons/cross-join.svg';
import { useAppDispatch, useAppSelector } from '../hooks';
import { QueryTableType, JoinType, QueryColumnType } from '../types/queryTypes';
import { LanguageType } from '../types/settingsType';

interface QueryTableHeaderProps {
  data: {
    table_type: string;
    table_name: string;
    table_alias?: string;
    table_schema: string;
    id: number;
  };
  target: string;
  handleCopy: () => void;
  language: LanguageType;
  handleRemoveTable: () => void;
}

const QueryTableHeader: React.FC<QueryTableHeaderProps> = ({
  target,
  data,
  language,
  handleCopy,
  handleRemoveTable,
}) => {
  return (
    <CardTitle className="d-flex pb-1 mb-0 border-bottom">
      <div className="px-1 flex-fill d-flex">
        <Button
          outline
          color="info"
          id={target}
          type="button"
          className="align-self-center btn-block p-0 px-1 text-left text-truncate"
        >
          {data.table_alias ? `${data.table_name} (${data.table_alias})` : `${data.table_name}`}
        </Button>
        <UncontrolledTooltip placement="top" target={target} className="text-truncate">
          {data.table_schema}
        </UncontrolledTooltip>
      </div>
      <ButtonGroup>
        <Button
          size="sm"
          color="secondary"
          className=""
          style={{ borderTopLeftRadius: '0px' }}
          onClick={handleCopy}
          id={`${target}_copy`}
        >
          <FontAwesomeIcon icon="copy" />
        </Button>
        <UncontrolledTooltip
          placement="top"
          target={`${target}_copy`}
          delay={{ show: 500, hide: 0 }}
          className="text-truncate"
        >
          {translations[language.code].tooltips.copyTable}
        </UncontrolledTooltip>
        <Button
          size="sm"
          className="align-self-start"
          color="danger"
          style={{ borderBottomRightRadius: '0px' }}
          onClick={handleRemoveTable}
          id={`${target}_remove`}
        >
          <FontAwesomeIcon icon="times" />
        </Button>
      </ButtonGroup>
      <QueryTablePopover target={target} data={data} />
    </CardTitle>
  );
};

interface QueryTableBodyProps {
  data: QueryTableType;
  id: string;
  constructData: (column: QueryColumnType) => any;
  joins?: JoinType[] | false;
}

const QueryTableBody: React.FC<QueryTableBodyProps> = ({ data, id, constructData, joins }) => {
  const dispatch = useAppDispatch();
  const handleRemove = (join: JoinType) => {
    dispatch(removeJoin(join));
  };
  return (
    <Scrollbars
      autoHeight
      autoHeightMax={400}
      onScroll={() => {
        // Force ArcherContainer to recalculate positions
        window.dispatchEvent(new Event('resize'));
      }}
    >
      <CardBody className="py-0 mt-2 mx-2 px-0 position-relative" style={{ zIndex: 1, backgroundColor: 'white' }}>
        {data.columns.map((column) => {
          const columnJoins = (joins || [])?.flatMap((join) => {
            const conditions = join.conditions.filter(
              (condition) =>
                (condition.main_column === column.column_name && condition.main_table?.id === data?.id) ||
                (condition.secondary_column === column.column_name && condition.secondary_table?.id === data?.id),
            );
            // Only return results if there are matching conditions
            return conditions.length ? conditions.map((condition) => ({ condition, join })) : [];
          });

          return (
            <ArcherElement
              key={`table-column-${_.uniqueId()}`}
              id={`${data.id}-column-${column.column_name}`}
              relations={
                columnJoins
                  ?.map((join, index) => {
                    const condition = join.condition;
                    const joinObj = join.join;
                    const mainTable = joinObj.conditions[0].main_table.table_name;
                    const secondaryTable = joinObj.conditions[0].secondary_table.table_name;
                    // Only create arrows from main table to secondary table
                    if (
                      joinObj.main_table?.id === data?.id &&
                      condition.main_column === column.column_name &&
                      joinObj.main_table?.id !== condition.secondary_table?.id &&
                      column.column_name === condition.main_column
                    ) {
                      return {
                        targetId: `${condition.secondary_table?.id}-column-${condition.secondary_column}`,
                        targetAnchor: condition.secondary_table?.id > joinObj.main_table?.id ? 'left' : 'right',
                        sourceAnchor: condition.secondary_table?.id > joinObj.main_table?.id ? 'right' : 'left',
                        label: (
                          <div className="join-controls">
                            <UncontrolledDropdown>
                              <DropdownToggle
                                color="light"
                                size="sm"
                                className="join-type-button"
                                style={{ padding: 0, top: '70px' }}
                              >
                                {joinObj.type === 'left' && <LeftJoinIcon style={{ width: '20px', height: '20px' }} />}
                                {joinObj.type === 'right' && (
                                  <RightJoinIcon style={{ width: '20px', height: '20px' }} />
                                )}
                                {joinObj.type === 'inner' && (
                                  <InnerJoinIcon style={{ width: '20px', height: '20px' }} />
                                )}
                                {joinObj.type === 'outer' && (
                                  <OuterJoinIcon style={{ width: '20px', height: '20px' }} />
                                )}
                                {joinObj.type === 'cross' && (
                                  <CorssJoinIcon style={{ width: '20px', height: '20px' }} />
                                )}
                              </DropdownToggle>
                              <DropdownMenu>
                                <DropdownItem
                                  onClick={() => dispatch(updateJoin({ ...joinObj, type: 'inner' }))}
                                  active={joinObj.type === 'inner'}
                                >
                                  Select only matching rows from <strong>{mainTable}</strong> and{' '}
                                  <strong>{secondaryTable}</strong> (Inner Join)
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() => dispatch(updateJoin({ ...joinObj, type: 'left' }))}
                                  active={joinObj.type === 'left'}
                                >
                                  Select all rows from <strong>{mainTable}</strong>, matching rows from{' '}
                                  <strong>{secondaryTable}</strong> (Left Join)
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() => dispatch(updateJoin({ ...joinObj, type: 'right' }))}
                                  active={joinObj.type === 'right'}
                                >
                                  Select all rows from <strong>{secondaryTable}</strong>, matching rows from{' '}
                                  <strong>{mainTable}</strong> (Right Join)
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() => dispatch(updateJoin({ ...joinObj, type: 'outer' }))}
                                  active={joinObj.type === 'outer'}
                                >
                                  Select all rows from both <strong>{mainTable}</strong> and{' '}
                                  <strong>{secondaryTable}</strong> (Full join)
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() => dispatch(updateJoin({ ...joinObj, type: 'cross' }))}
                                  active={joinObj.type === 'cross'}
                                >
                                  Combine every row from <strong>{mainTable}</strong> with every row from{' '}
                                  <strong>{secondaryTable}</strong> (Cross Join)
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem className="text-danger" onClick={() => handleRemove(joinObj)}>
                                  Delete Join
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </div>
                        ),
                      };
                    }
                    return null;
                  })
                  .filter((relation): relation is any => relation !== null) || []
              }
            >
              <div>
                <TableColumn
                  id={`${id}-table-column-${_.uniqueId()}`}
                  data={constructData(column)}
                  joins={columnJoins}
                />
              </div>
            </ArcherElement>
          );
        })}
      </CardBody>
    </Scrollbars>
  );
};

interface QueryTableProps {
  data: QueryTableType;
  id: string;
}

const QueryTable: React.FC<QueryTableProps> = ({ data, id }) => {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.settings.language);
  const queryType = useAppSelector((state) => state.query.queryType);
  const joins = useAppSelector((state) => state.query.joins);
  const firstTableId = useAppSelector((state) => state.query.tables[0]?.id);

  const handleRemoveTable = () => {
    if (['DELETE', 'UPDATE'].includes(queryType) && data.id === firstTableId) {
      dispatch(resetQuery(queryType));
    } else {
      dispatch(removeTable(data));
    }
  };

  const handleCopy = () => {
    dispatch(addTable(data));
  };

  const constructData = (column: QueryColumnType) => ({
    ...column,
    table_name: data.table_name,
    table_schema: data.table_schema,
    table_alias: data.table_alias,
    table_id: data.id,
  });

  const tableJoins =
    joins.length > 0 &&
    joins.filter(
      (join) =>
        join.main_table.id === data.id || join.conditions.some((condition) => condition.secondary_table.id === data.id),
    );

  return (
    <Card className="d-inline-flex m-2 pb-2 mr-4 position-relative">
      <QueryTableHeader
        target={id}
        data={data}
        language={language}
        handleRemoveTable={handleRemoveTable}
        handleCopy={handleCopy}
      />
      <QueryTableBody data={data} id={id} constructData={constructData} joins={tableJoins} />
    </Card>
  );
};

export default QueryTable;

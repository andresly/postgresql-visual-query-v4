import React, { useState } from 'react';
import { Button, ButtonGroup, Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { Handle, Position } from '@xyflow/react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { addColumn, removeColumn, addJoin, updateJoin } from '../actions/queryActions';
import { iconPicker } from '../utils/iconPicker';
import { QueryColumnType, JoinType, JoinConditionType } from '../types/queryTypes';
import { DatabaseColumnType, DatabaseConstraintType } from '../types/databaseTypes';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface TableColumnProps {
  id?: string;
  data: QueryColumnType;
  joins?: { condition: JoinConditionType; join: JoinType }[];
}

const TableColumn: React.FC<TableColumnProps> = ({ id, data, joins: columnJoins }) => {
  const dispatch = useAppDispatch();
  const columns = useAppSelector((state) => state.query.columns);
  const joins = useAppSelector((state) => state.query.joins);
  const databaseColumns = useAppSelector((state) => state.database.columns);
  const constraints = useAppSelector((state) => state.database.constraints);

  const [toggleStatus, setToggleStatus] = useState(false);
  const [target] = useState(id);
  const [foreignKeys] = useState(() =>
    data.constraints.filter((constraint) => constraint.constraint_type.localeCompare('FOREIGN KEY') === 0),
  );

  const toggle = () => {
    setToggleStatus(!toggleStatus);
  };

  const handleRemove = () => {
    dispatch(removeColumn(data));
  };

  const handleOnChange = () => {
    dispatch(addColumn(data));
  };

  const btnSelected = columns.some(
    (column) => _.isEqual(column.table_id, data.table_id) && _.isEqual(column.column_name, data.column_name),
  )
    ? 'success'
    : 'light';

  const lineRelations = [];

  if (joins) {
    // Find joins where current column is the main column
    const mainColumnJoins = joins.filter((join) =>
      join.conditions.some(
        (condition) =>
          _.isEqual(condition?.main_table?.id, data.table_id) && _.isEqual(condition.main_column, data.column_name),
      ),
    );

    if (mainColumnJoins.length > 0) {
      for (let i = 0; i < mainColumnJoins.length; i++) {
        const join = mainColumnJoins[i];
        const secondaryTable = join.conditions[0].secondary_table;
        const secondaryColumnName = join.conditions[0].secondary_column;
        const secondaryId = `${secondaryTable.id}-column-${secondaryColumnName}`;
        lineRelations.push({
          targetId: secondaryId,
          style: { strokeColor: 'blue', strokeWidth: 1 },
        });
      }
    }
  }

  // Create a unique ID for this column for React Flow connections
  const columnId = `${data.table_id}-${data.column_name}`;

  return (
    <div
      className="d-flex align-items-center position-relative"
      data-column-id={`${data.table_id}-${data.column_name}`}
      id={`${data.table_id}-column-${data.column_name}`}
    >
      {/* Add React Flow connection handles */}
      <Handle
        type="source"
        id={`${columnId}-right-source`}
        position={Position.Right}
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          right: '-4px',
          zIndex: 2,
        }}
      />
      <Handle
        type="target"
        id={`${columnId}-right-target`}
        position={Position.Right}
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          right: '-4px',
          zIndex: 1,
        }}
      />

      {/* Left side: source & target */}
      <Handle
        type="source"
        id={`${columnId}-left-source`}
        position={Position.Left}
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px',
          zIndex: 2,
        }}
      />
      <Handle
        type="target"
        id={`${columnId}-left-target`}
        position={Position.Left}
        style={{
          background: '#555',
          width: '8px',
          height: '8px',
          left: '-4px',
          zIndex: 1,
        }}
      />

      <ButtonGroup size="sm" className="btn-block my-1 p-0 px-1">
        <Button
          color={btnSelected}
          className="text-left d-flex flex-row align-items-center w-100 px-1 border"
          id={`${target}-type`}
          onClick={handleOnChange}
        >
          {data.constraints.some((c) => c.constraint_type.localeCompare('PRIMARY KEY') === 0) && (
            <div className="mr-2 px-2 bg-info text-light rounded-pill">PK</div>
          )}
          <div className="text-truncate d-flex">
            {!data.constraints.some((c) => c.constraint_type.localeCompare('PRIMARY KEY') === 0) && (
              <span className={`mr-1 px-2 ${btnSelected === 'light' ? 'text-info' : 'text-light'}`}>
                <FontAwesomeIcon icon={iconPicker(data.data_type) as IconProp} />
              </span>
            )}
            <div className="text-truncate">{data.column_name}</div>
          </div>
          <div className="ml-auto pl-3">
            <div className="bg-light rounded-pill">
              {joins.map((join) =>
                join.conditions.map(
                  (condition) =>
                    ((_.isEqual(join.main_table.id, data.table_id) &&
                      _.isEqual(condition.main_column, data.column_name)) ||
                      (_.isEqual(condition.secondary_table.id, data.table_id) &&
                        _.isEqual(condition.secondary_column, data.column_name))) && (
                      <FontAwesomeIcon
                        key={`condition-icon-${data.table_schema}-${data.table_name}-${data.column_name}-${_.uniqueId()}`}
                        className="mx-1"
                        icon={'link' as IconProp}
                        style={{ color: join.color }}
                      />
                    ),
                ),
              )}
            </div>
          </div>
        </Button>
        <Tooltip
          placement="left"
          isOpen={toggleStatus}
          target={`${target}-type`}
          toggle={toggle}
          modifiers={{
            preventOverflow: { enabled: false },
            hide: { enabled: false },
          }}
          delay={{ show: 0, hide: 0 }}
        >
          {data.data_type}
        </Tooltip>
        {foreignKeys.length > 0 && (
          <Button outline color="info" id={target} type="button">
            <FontAwesomeIcon icon={'external-link-square-alt' as IconProp} />
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
};

export default TableColumn;

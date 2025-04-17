import React, { Component } from 'react';
import { useDrag, useDrop, DragPreviewImage } from 'react-dnd';
import {} from /* getEmptyImage */ 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import { Button, ButtonGroup, Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import * as PropTypes from 'prop-types';
import TableColumnPopover from './TableColumnPopover';
import { addColumn, removeColumn, addJoin, updateJoin } from '../actions/queryActions';
import { withToggle } from '../hocs/withToggle';
import { iconPicker } from '../utils/iconPicker';
// Import Handle component from React Flow for connections
import { Handle, Position } from '@xyflow/react';

// Drag and Drop wrapper component
const DraggableColumn = ({ children, data, onDrop }) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'COLUMN',
    item: { ...data },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'COLUMN',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Removing this so you can see the default drag preview
  // React.useEffect(() => {
  //   preview(getEmptyImage(), { captureDraggingState: true });
  // }, [preview]);

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? 'rgba(0,0,0,0.1)' : undefined,
      }}
      className="d-flex align-items-center position-relative"
      data-column-id={`${data.table_id}-${data.column_name}`}
      id={`${data.table_id}-column-${data.column_name}`}
    >
      {children}
    </div>
  );
};

export class TableColumn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      target: props.id,
      foreignKeys: this.findForeignKeys(),
    };

    this.handleRemove = this.handleRemove.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.findForeignKeys = this.findForeignKeys.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  handleRemove(data) {
    this.props.removeColumn(data);
  }

  handleOnChange() {
    this.props.addColumn(this.props.data);
  }

  handleDrop(sourceColumn) {
    if (sourceColumn.table_id === this.props.data.table_id) {
      return;
    }
    // First create a new join object
    const newJoin = {
      id: this.props.joins.length,
      type: 'inner',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      main_table: {
        id: sourceColumn.table_id,
        table_schema: sourceColumn.table_schema,
        table_name: sourceColumn.table_name,
        table_type: sourceColumn.table_type || 'BASE TABLE',
        table_alias: sourceColumn.table_alias || '',
        columns: this.props.databaseColumns
          .filter(
            (column) =>
              column.table_schema === sourceColumn.table_schema && column.table_name === sourceColumn.table_name,
          )
          .map((column) => ({
            ...column,
            table_id: sourceColumn.table_id,
            table_alias: sourceColumn.table_alias || '',
            constraints: this.props.constraints.filter(
              (constraint) =>
                constraint.table_schema === column.table_schema &&
                constraint.table_name === column.table_name &&
                constraint.column_name.includes(column.column_name),
            ),
          })),
      },
      conditions: [
        {
          id: 0,
          main_column: sourceColumn.column_name,
          main_table: {
            id: sourceColumn.table_id,
            table_schema: sourceColumn.table_schema,
            table_name: sourceColumn.table_name,
            table_alias: sourceColumn.table_alias || '',
          },
          secondary_table: {
            id: this.props.data.table_id,
            table_schema: this.props.data.table_schema,
            table_name: this.props.data.table_name,
            table_type: this.props.data.table_type || 'BASE TABLE',
            table_alias: this.props.data.table_alias || '',
            columns: this.props.databaseColumns
              .filter(
                (column) =>
                  column.table_schema === this.props.data.table_schema &&
                  column.table_name === this.props.data.table_name,
              )
              .map((column) => ({
                ...column,
                table_id: this.props.data.table_id,
                table_alias: this.props.data.table_alias || '',
                constraints: this.props.constraints.filter(
                  (constraint) =>
                    constraint.table_schema === column.table_schema &&
                    constraint.table_name === column.table_name &&
                    constraint.column_name.includes(column.column_name),
                ),
              })),
          },
          secondary_column: this.props.data.column_name,
        },
      ],
    };

    // Clone the join object before updating
    const join = _.cloneDeep(newJoin);

    // Add the join first only if it is not already present
    if (!this.props.joins.some((existingJoin) => existingJoin.id === join.id)) {
      this.props.addJoin(join, true);
    }

    // Then update it
    this.props.updateJoin(join);
  }

  findForeignKeys() {
    return this.props.data.constraints.filter(
      (constraint) => constraint.constraint_type.localeCompare('FOREIGN KEY') === 0,
    );
  }

  render() {
    const btnSelected = this.props.columns.some(
      (column) =>
        _.isEqual(column.table_id, this.props.data.table_id) &&
        _.isEqual(column.column_name, this.props.data.column_name),
    )
      ? 'success'
      : 'light';

    const lineRelations = [];

    if (this.props.joins) {
      // Find joins where current column is the main column
      const mainColumnJoins = this.props.joins.filter((join) =>
        join.conditions.some(
          (condition) =>
            _.isEqual(condition?.main_table?.id, this.props.data.table_id) &&
            _.isEqual(condition.main_column, this.props.data.column_name),
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
    const columnId = `${this.props.data.table_id}-${this.props.data.column_name}`;

    return (
      <DraggableColumn data={this.props.data} onDrop={this.handleDrop}>
        {/* Add React Flow connection handles */}
        <Handle
          type="source"
          position={Position.Right}
          id={`${columnId}-right`}
          style={{
            background: '#555',
            width: '8px',
            height: '8px',
            right: '-4px',
            visibility: 'visible',
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id={`${columnId}-left`}
          style={{
            background: '#555',
            width: '8px',
            height: '8px',
            left: '-4px',
            visibility: 'visible',
          }}
        />

        <ButtonGroup size="sm" className="btn-block my-1 p-0 px-1">
          <Button
            color={btnSelected}
            className="text-left d-flex flex-row align-items-center w-100 px-1 border"
            id={`${this.state.target}-type`}
            onClick={this.handleOnChange}
          >
            {this.props.data.constraints.some((c) => c.constraint_type.localeCompare('PRIMARY KEY') === 0) && (
              <div className="mr-2 px-2 bg-info text-light rounded-pill">PK</div>
            )}
            <div className="text-truncate d-flex">
              {!this.props.data.constraints.some((c) => c.constraint_type.localeCompare('PRIMARY KEY') === 0) && (
                <span className={`mr-1 px-2 ${btnSelected === 'light' ? 'text-info' : 'text-light'}`}>
                  <FontAwesomeIcon icon={iconPicker(this.props.data.data_type)} />
                </span>
              )}
              <div className="text-truncate">{this.props.data.column_name}</div>
            </div>
            <div className="ml-auto pl-3">
              <div className="bg-light rounded-pill">
                {this.props.joins.map((join) =>
                  join.conditions.map(
                    (condition) =>
                      ((_.isEqual(join.main_table.id, this.props.data.table_id) &&
                        _.isEqual(condition.main_column, this.props.data.column_name)) ||
                        (_.isEqual(condition.secondary_table.id, this.props.data.table_id) &&
                          _.isEqual(condition.secondary_column, this.props.data.column_name))) && (
                        <FontAwesomeIcon
                          key={`condition-icon-${this.props.data.table_schema}-${this.props.data.table_name}-${this.props.data.column_name}-${_.uniqueId()}`}
                          className="mx-1"
                          icon="link"
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
            isOpen={this.props.toggleStatus}
            target={`${this.state.target}-type`}
            toggle={this.props.toggle}
            modifiers={{
              preventOverflow: { enabled: false },
              hide: { enabled: false },
            }}
            delay={{ hide: 0 }}
          >
            {this.props.data.data_type}
          </Tooltip>
          {this.state.foreignKeys.length > 0 && (
            <Button outline color="info" id={this.state.target} type="button">
              <FontAwesomeIcon icon="external-link-square-alt" />
            </Button>
          )}
        </ButtonGroup>
      </DraggableColumn>
    );
  }
}

TableColumn.propTypes = {
  id: PropTypes.string,
  removeColumn: PropTypes.func,
  addColumn: PropTypes.func,
  data: PropTypes.shape({
    constraints: PropTypes.arrayOf(
      PropTypes.shape({
        constraint_type: PropTypes.string,
      }),
    ),
    table_id: PropTypes.number,
    column_name: PropTypes.string,
    table_schema: PropTypes.string,
    table_name: PropTypes.string,
    data_type: PropTypes.string,
  }),
  columns: PropTypes.arrayOf(PropTypes.shape({})),
  joins: PropTypes.arrayOf(
    PropTypes.shape({
      main_table: PropTypes.shape({ id: PropTypes.number }),
      conditions: PropTypes.arrayOf(
        PropTypes.shape({
          main_column: PropTypes.string,
          secondary_column: PropTypes.string,
          secondary_table: PropTypes.shape({ id: PropTypes.number }),
        }),
      ),
    }),
  ),
  toggle: PropTypes.func,
  toggleStatus: PropTypes.bool,
  addJoin: PropTypes.func.isRequired,
  updateJoin: PropTypes.func.isRequired,
  databaseColumns: PropTypes.arrayOf(
    PropTypes.shape({
      column_name: PropTypes.string,
      ordinal_position: PropTypes.number,
      data_type: PropTypes.string,
      table_name: PropTypes.string,
      table_schema: PropTypes.string,
    }),
  ).isRequired,
  constraints: PropTypes.arrayOf(
    PropTypes.shape({
      constraint_name: PropTypes.string,
      constraint_type: PropTypes.string,
      table_schema: PropTypes.string,
      table_name: PropTypes.string,
      column_name: PropTypes.string,
      foreign_table_schema: PropTypes.string,
      foreign_table_name: PropTypes.string,
      foreign_column_name: PropTypes.string,
    }),
  ).isRequired,
};

const mapStateToProps = (store) => ({
  joins: store.query.joins,
  columns: store.query.columns,
  databaseColumns: store.database.columns,
  constraints: store.database.constraints,
});

const mapDispatchToProps = {
  removeColumn,
  addColumn,
  addJoin,
  updateJoin,
};

export default withToggle(connect(mapStateToProps, mapDispatchToProps)(TableColumn));

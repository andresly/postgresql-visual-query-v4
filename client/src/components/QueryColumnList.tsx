import * as React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { CustomInput, FormGroup, Input, InputGroup, UncontrolledTooltip } from 'reactstrap';
import _ from 'lodash';
import { useAppSelector, useAppDispatch } from '../hooks';
import { setLimitValue, switchDistinct, switchLimit, switchTies, updateColumnsOrder } from '../actions/queryActions';
import QueryColumn from './QueryColumn';
import FilterOperandSelectbox from './FilterOperandSelectbox';
import { translations } from '../utils/translations';
import { QueryColumnType } from '../types/queryTypes';

export const QueryColumnList: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    columns,
    distinct,
    limit,
    limitValue,
    withTies,
    language,
    id: queryId,
  } = useAppSelector((state) => ({
    columns: _.orderBy(state.query.columns, ['filter_as_having'], ['asc']),
    distinct: state.query.distinct,
    limit: state.query.limit,
    limitValue: state.query.limitValue.toString(),
    withTies: state.query.withTies,
    language: state.settings.language,
    id: state.query.id,
  }));

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const movedColumn = columns.find((column) => _.isEqual(draggableId, `query-column-${column.id}`));

    if (!movedColumn) {
      return;
    }

    const newColumns = Array.from(columns);
    newColumns.splice(source.index, 1);
    newColumns.splice(destination.index, 0, movedColumn);

    dispatch(updateColumnsOrder(newColumns));
  };

  const showFilterOperandSelectbox = (column: QueryColumnType, queryColumns: QueryColumnType[], index: number) =>
    column.column_filter.length &&
    index !== queryColumns.length - 1 &&
    queryColumns[index + 1].column_filter.length &&
    queryColumns[index + 1].filter_as_having === queryColumns[index].filter_as_having;

  return (
    <div className="mt-2">
      <FormGroup className="d-flex m-auto align-items-center">
        <CustomInput
          type="switch"
          id="distinct"
          label={translations[language.code].queryBuilder.distinctL}
          checked={distinct}
          onChange={() => dispatch(switchDistinct())}
        />
        <CustomInput
          className="ml-2 mr-2"
          type="switch"
          id="limit_switch"
          label={translations[language.code].queryBuilder.limitL}
          checked={limit}
          onChange={() => dispatch(switchLimit())}
        />
        {limit && (
          <InputGroup className="w-auto" size="sm">
            <Input
              id="limit"
              placeholder="Value"
              value={limitValue}
              min={0}
              max={999}
              type="number"
              step="1"
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                dispatch(setLimitValue(value));
              }}
            />
            <UncontrolledTooltip placement="top" delay={{ show: 500, hide: 0 }} target="limit">
              {translations[language.code].tooltips.limitValue}
            </UncontrolledTooltip>
            <CustomInput
              className="ml-2 mr-2"
              type="switch"
              id="ties_switch"
              label="With ties"
              checked={withTies}
              onChange={() => dispatch(switchTies())}
            />
          </InputGroup>
        )}
      </FormGroup>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-columns">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {columns.map((column, index) => (
                <React.Fragment key={column.id}>
                  <QueryColumn
                    key={`query-column-${column.id}-queryId-${queryId}`}
                    id={`query-column-${column.id}`}
                    index={index}
                    data={column}
                  />
                  {showFilterOperandSelectbox(column, columns, index) ? (
                    <FilterOperandSelectbox column={column} />
                  ) : null}
                </React.Fragment>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default QueryColumnList;

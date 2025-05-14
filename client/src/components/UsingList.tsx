import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { addUsing } from '../actions/queryActions';
import Using from './Using';
import { useAppSelector, useAppDispatch } from '../hooks';
import { UsingType, JoinType } from '../types/queryTypes';

interface UsingListProps {
  updateJoins?: (joins: JoinType[]) => void;
  joins?: JoinType[];
}

export const UsingList: React.FC<UsingListProps> = ({ updateJoins, joins = [] }) => {
  const dispatch = useAppDispatch();
  const using = useAppSelector((state) => state.query.using) as UsingType[];
  const tables = useAppSelector((state) => state.query.tables);
  const queryId = useAppSelector((state) => state.query.id);

  const onDragEnd = (result: DropResult) => {
    if (!updateJoins || !joins) return;

    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const movedJoins = joins.find((join) => draggableId.localeCompare(`join-${join.id}`) === 0);
    if (!movedJoins) return;

    const newJoins = Array.from(joins);

    newJoins.splice(source.index, 1);
    newJoins.splice(destination.index, 0, movedJoins);

    updateJoins(newJoins);
  };

  const handleAddUsing = () => {
    dispatch(addUsing());
  };

  return (
    <div>
      <div className="text-info">
        <Button className="mb-1" outline color="info" size="sm" onClick={handleAddUsing} disabled={_.isEmpty(tables)}>
          <FontAwesomeIcon icon="plus" />
        </Button>{' '}
        Add join
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-columns">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {using.map((usingItem) => (
                <Using
                  key={`using-${usingItem.id}-query-${queryId}`}
                  id={`using-${usingItem.id}-query-${queryId}`}
                  using={usingItem}
                  queryId={queryId}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default UsingList;

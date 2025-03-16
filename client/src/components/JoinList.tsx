import React from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { addJoin, updateJoinsOrder } from '../actions/queryActions';
import Join from './Join';
import { translations } from '../utils/translations';

export const JoinList: React.FC = () => {
  const { joins, tables } = useAppSelector((state) => state.query);
  const language = useAppSelector((state) => state.settings.language);
  const queryId = useAppSelector((state) => state.query.id);
  const dispatch = useAppDispatch();

  const onDragEnd = (result: any) => {
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

    dispatch(updateJoinsOrder(newJoins));
  };

  const handleAddJoin = () => {
    dispatch(addJoin());
  };

  return (
    <div>
      <div className="text-info">
        <Button className="mb-1" outline color="info" size="sm" onClick={handleAddJoin} disabled={_.isEmpty(tables)}>
          <FontAwesomeIcon icon="plus" />
        </Button>{' '}
        {translations[language.code].queryBuilder.addJoin}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-columns">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {joins.map((join, index) => (
                <Join
                  key={`join-${join.id}-query-${queryId}`}
                  id={`join-${join.id}-query-${queryId}`}
                  join={join}
                  index={index}
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

export default JoinList;

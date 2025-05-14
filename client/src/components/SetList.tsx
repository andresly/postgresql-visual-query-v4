import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { addSet, updateSetsOrder } from '../actions/queryActions';
import { translations } from '../utils/translations';
import Set from './Set';
import { useAppSelector, useAppDispatch } from '../hooks';
import { RootState } from '../store';
import { SetType } from '../types/queryTypes';

const SetList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sets, tables, language, queryId, queryName } = useAppSelector((state: RootState) => ({
    sets: state.query.sets,
    tables: state.query.tables,
    language: state.settings.language,
    queryId: state.query.id,
    queryName: state.query.queryName,
  }));

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const movedSets = sets.find((set) => draggableId.localeCompare(`set-${set.id}`) === 0);
    if (!movedSets) return;

    const newSets = Array.from(sets);

    newSets.splice(source.index, 1);
    newSets.splice(destination.index, 0, movedSets);

    // Cast to any to bypass the type checking issue
    dispatch(updateSetsOrder(newSets as any));
  };

  const handleAddSet = () => {
    dispatch(addSet());
  };

  return (
    <div>
      <div className="text-info">
        <Button className="mb-1" outline color="info" size="sm" onClick={handleAddSet} disabled={_.isEmpty(tables)}>
          <FontAwesomeIcon icon="plus" />
        </Button>{' '}
        {translations[language.code].queryBuilder.addSet}
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-columns">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {sets.map((set: SetType, index: number) => (
                <Set
                  key={`set-${set.id}-queryId-${queryId}`}
                  id={`set-${set.id}`}
                  set={set}
                  index={index}
                  queryId={queryId}
                  queryName={queryName}
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

export default SetList;

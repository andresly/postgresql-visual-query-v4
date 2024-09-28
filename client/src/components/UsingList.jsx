import React from 'react';
import { connect } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import * as PropTypes from 'prop-types';
import { addUsing } from '../actions/queryActions';
import Using from './Using';

export const UsingList = (props) => {
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const movedJoins = props.joins.find(join => draggableId.localeCompare(`join-${join.id}`) === 0);
    const newJoins = Array.from(props.joins);

    newJoins.splice(source.index, 1);
    newJoins.splice(destination.index, 0, movedJoins);

    props.updateJoins(newJoins);
  };

  const handleAddUsing = () => {
    props.addUsing();
  };

  return (
    <div>
      <div className="text-info">
        <Button
          className="mb-1"
          outline
          color="info"
          size="sm"
          onClick={handleAddUsing}
          disabled={_.isEmpty(props.tables)}
        >
          <FontAwesomeIcon icon="plus" />
        </Button>
        {' '}
        Add join
      </div>
      <DragDropContext
        onDragEnd={onDragEnd}
      >
        <Droppable droppableId="droppable-columns">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {props.using.map((using, index) => (
                <Using
                  key={`using-${using.id}-query-${props.queryId}`}
                  id={`using-${using.id}-query-${props.queryId}`}
                  using={using}
                  index={index}
                  queryId={props.queryId}
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

UsingList.propTypes = {
  joins: PropTypes.arrayOf(PropTypes.shape({})),
  addJoin: PropTypes.func,
  updateJoins: PropTypes.func,
  language: PropTypes.shape({ code: PropTypes.string }),
  tables: PropTypes.arrayOf(PropTypes.shape({
    table_alias: PropTypes.string,
    table_name: PropTypes.string,
    table_schema: PropTypes.string,
  })),
  queryId: PropTypes.number,
};

const mapStateToProps = store => ({
  using: store.query.using,
  tables: store.query.tables,
  language: store.settings.language,
  queryId: store.query.id,
  queryType: store.query.queryType,
});

const mapDispatchToProps = {
  addUsing,
};

export default connect(mapStateToProps, mapDispatchToProps)(UsingList);

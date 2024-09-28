import React from 'react';
import { connect } from 'react-redux';
import {
  Button,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { removeColumn } from '../actions/queryActions';

export const RemoveColumnButton = (props) => {
  const handleRemoveColumn = () => {
    props.removeColumn(props.column);
  };

  return (
    <Button
      className="mr-2 float-right"
      name={props.column.id}
      size="sm"
      color="danger"
      onClick={handleRemoveColumn}
    >
      <FontAwesomeIcon icon="times" />
    </Button>
  );
};

const mapDispatchToProps = {
  removeColumn,
};

export default connect(null, mapDispatchToProps)(RemoveColumnButton);

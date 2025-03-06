import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button } from 'reactstrap';

interface AddNewButtonProps {
  id?: string;
  size?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const AddNewButton: React.FC<AddNewButtonProps> = ({ id, size, onClick }) => (
  <Button className="" outline color="info" size={size} id={id} onClick={onClick}>
    <FontAwesomeIcon icon="plus" />
  </Button>
);

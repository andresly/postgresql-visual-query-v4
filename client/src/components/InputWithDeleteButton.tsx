import { Button, Input, InputGroup, InputGroupAddon, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ChangeEvent } from 'react';

interface InputWithDeleteButtonProps {
  id: string;
  placeholder?: string;
  className?: string;
  tooltipTarget: string;
  tooltipText: string;
  value: string;
  name: string;
  handleRemove: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const InputWithDeleteButton: React.FC<InputWithDeleteButtonProps> = ({
  id,
  placeholder,
  className,
  tooltipTarget,
  tooltipText,
  value,
  name,
  handleRemove,
  handleChange,
}) => (
  <InputGroup className={className} size="sm">
    <Input
      className="text-dark w-auto"
      type="text"
      id={id}
      value={value}
      onBlur={handleChange}
      name={name}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ flexBasis: 'auto' }}
    />
    <UncontrolledTooltip placement="top" delay={{ show: 500, hide: 0 }} target={tooltipTarget}>
      {tooltipText}
    </UncontrolledTooltip>
    <InputGroupAddon addonType="append">
      <Button color="danger" id={id} onClick={handleRemove} name={name}>
        <FontAwesomeIcon icon="times" />
      </Button>
    </InputGroupAddon>
  </InputGroup>
);

import React, { useState } from 'react';
import { Button, Input, InputGroup, InputGroupAddon, Popover, PopoverBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import _ from 'lodash';
import { updateTable } from '../actions/queryActions';
import { useAppSelector, useAppDispatch } from '../hooks';
import { translations } from '../utils/translations';
import { QueryTableType } from '../types/queryTypes';
import { LanguageType } from '../types/settingsType';

interface QueryTablePopoverProps {
  data: QueryTableType;
  toggle: () => void;
  toggleStatus: boolean;
  target: string;
}

export const QueryTablePopover: React.FC<QueryTablePopoverProps> = ({ data, toggle, toggleStatus, target }) => {
  const [tableAlias, setTableAlias] = useState(data.table_alias);
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.settings.language);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTableAlias(e.target.value);
  };

  const handleRemove = () => {
    setTableAlias('');
    const updatedTable = _.cloneDeep(data);
    updatedTable.table_alias = '';
    dispatch(updateTable(updatedTable));
  };

  const handleSave = () => {
    const updatedTable = _.cloneDeep(data);
    updatedTable.table_alias = tableAlias;
    dispatch(updateTable(updatedTable));
  };

  return (
    <Popover
      trigger="legacy"
      placement="bottom"
      isOpen={toggleStatus}
      target={target}
      delay={{ show: 0, hide: 0 }}
      toggle={toggle}
    >
      <PopoverBody>
        <InputGroup size="sm">
          <Input
            type="text"
            name="table_alias"
            id="table_alias"
            placeholder={translations[language.code].queryBuilder.aliasH}
            onBlur={handleSave}
            onChange={handleChange}
            value={tableAlias}
          />
          <InputGroupAddon addonType="append">
            <Button color="danger" id="table_alias" onClick={handleRemove}>
              <FontAwesomeIcon icon="times" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </PopoverBody>
    </Popover>
  );
};

export default QueryTablePopover;

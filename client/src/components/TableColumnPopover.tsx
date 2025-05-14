import React from 'react';
import { Popover, PopoverBody, PopoverHeader, Table } from 'reactstrap';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { withToggle } from '../hocs/withToggle';
import { translations } from '../utils/translations';
import { useAppSelector } from '../hooks';
import { LanguageType } from '../types/settingsType';
import { QueryColumnType } from '../types/queryTypes';

interface ForeignKey {
  foreign_table_schema: string;
  foreign_table_name: string;
  foreign_column_name: string;
  constraint_name: string;
  constraint_type: string;
  column_name: string;
  table_name: string;
  table_schema: string;
}

interface TableColumnPopoverProps {
  data?: QueryColumnType;
  toggle: () => void;
  toggleStatus: boolean;
  target: string;
  foreignKeys: ForeignKey[];
}

export const TableColumnPopover: React.FC<TableColumnPopoverProps> = ({
  toggle,
  toggleStatus,
  target,
  foreignKeys,
}) => {
  const language = useAppSelector((state) => state.settings.language) as LanguageType;

  const modifiers = {
    preventOverflow: {
      enabled: false,
    },
    hide: {
      enabled: false,
    },
  };

  return (
    <Popover
      modifiers={modifiers}
      placement="right"
      trigger="legacy"
      isOpen={toggleStatus}
      target={target}
      toggle={toggle}
      delay={{ show: 0, hide: 0 }}
    >
      <PopoverHeader>{translations[language.code].queryBuilder.foreignKeyH}</PopoverHeader>
      <PopoverBody className="p-1">
        <Scrollbars autoHeight autoHeightMax={350}>
          <Table bordered className="table-sm mb-3">
            <thead>
              <tr>
                <th>{translations[language.code].queryBuilder.schemaTh}</th>
                <th>{translations[language.code].queryBuilder.tableTh}</th>
                <th>{translations[language.code].queryBuilder.columnTh}</th>
              </tr>
            </thead>
            <tbody>
              {foreignKeys.map((fk) => (
                <tr key={`${fk.foreign_table_schema}_${fk.foreign_table_name}_${fk.foreign_column_name}`}>
                  <td>{fk.foreign_table_schema}</td>
                  <td>{fk.foreign_table_name}</td>
                  <td>{fk.foreign_column_name}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Scrollbars>
      </PopoverBody>
    </Popover>
  );
};

export default withToggle(TableColumnPopover);

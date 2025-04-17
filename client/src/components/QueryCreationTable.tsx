import React, { useState } from 'react';
import _ from 'lodash';
import { CustomInput, FormGroup, Input, InputGroup } from 'reactstrap';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import QueryCreationTableColumn from './QueryCreationTableColumn';
import { useAppSelector, useAppDispatch } from '../hooks';
import { switchDistinct, switchLimit, switchTies, setLimitValue, updateColumnsOrder } from '../actions/queryActions';
import { useTranslation } from '../hooks/useTranslation';

// Custom tooltip styles
const tooltipStyle = {
  backgroundColor: '#f8f9fa',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '8px 12px',
  maxWidth: '400px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  zIndex: 1000,
};

// Format tooltip content to make links clickable
const formatTooltipContent = (content: string) => {
  // Check if the content contains link
  if (!content.includes('https://')) return content;

  // Split content at "More info: " to separate text and link
  const parts = content.split('More info: ');
  const text = parts[0];
  const link = parts[1];

  return (
    <div>
      {text}
      <span>More info: </span>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#007bff', textDecoration: 'underline' }}
        onClick={(e) => e.stopPropagation()} // Prevent tooltip from closing when clicking link
      >
        {link}
      </a>
    </div>
  );
};

// Custom tooltip component
interface CustomTooltipProps {
  id: string;
  children: React.ReactNode;
  activeTooltip: string | null;
  toggleTooltip: (id: string) => void;
  position?: 'right' | 'top' | 'bottom';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  id,
  children,
  activeTooltip,
  toggleTooltip,
  position = 'right',
}) => {
  const isActive = activeTooltip === `tooltip-${id}`;

  // Calculate positioning styles based on position prop
  const getPositionStyles = () => {
    if (id === 'column') {
      return {
        left: 'calc(100% + 10px)',
        top: '50%',
        transform: 'translateY(-20%)',
      };
    }
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '10px',
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '10px',
        };
      case 'right':
      default:
        return {
          left: 'calc(100% + 10px)',
          top: '50%',
          transform: 'translateY(-50%)',
        };
    }
  };

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span
        className="ml-2"
        id={`tooltip-${id}`}
        style={{ cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          toggleTooltip(`tooltip-${id}`);
        }}
      >
        <FontAwesomeIcon icon={faQuestionCircle} size="sm" style={{ color: isActive ? '#007bff' : '#6c757d' }} />
      </span>
      {isActive && (
        <div
          style={{
            ...tooltipStyle,
            position: 'absolute',
            width: '400px',
            ...getPositionStyles(),
          }}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside tooltip
        >
          {children}
        </div>
      )}
    </span>
  );
};

export const QueryCreationTable = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Retrieve state using selectors
  const { columns, distinct, limit, limitValue, withTies } = useAppSelector((store) => ({
    columns: _.orderBy(store.query.columns, ['filter_as_having'], ['asc']),
    distinct: store.query.distinct,
    limit: store.query.limit,
    limitValue: store.query.limitValue,
    withTies: store.query.withTies,
  }));

  // Toggle tooltip visibility
  const toggleTooltip = (tooltipId: string) => {
    setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId);
  };

  // Calculate maxConditions from all columns
  const maxConditions = columns.length > 0 ? Math.max(...columns.map((col) => col.column_conditions.length)) : 2;

  // Create dynamic table labels array
  const baseLabels = [
    { id: 'column', label: t('queryBuilder.columnLabel') },
    { id: 'alias', label: t('queryBuilder.aliasLabel') },
    { id: 'table', label: t('queryBuilder.tableLabel') },
    { id: 'aggregate', label: t('queryBuilder.aggregateLabel') },
    { id: 'scalar', label: t('queryBuilder.scalarLabel') },
    { id: 'sort', label: t('queryBuilder.sortLabel') },
    { id: 'sort-order', label: t('queryBuilder.sortOrderLabel') },
    { id: 'show', label: t('queryBuilder.showLabel') },
    { id: 'remove-duplicates', label: t('queryBuilder.removeDuplicatesLabel') },
    { id: 'criteria', label: t('queryBuilder.criteriaLabel') },
  ];

  // Add "Or" labels for remaining conditions
  const tableLabels = [
    ...baseLabels,
    ...Array(maxConditions - 1)
      .fill(null)
      .map((_, i) => ({
        id: `or-${i + 1}`,
        label: t('queryBuilder.orLabel'),
      })),
  ];

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

  return (
    <div onClick={() => activeTooltip && setActiveTooltip(null)}>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="query-table-container" style={{ display: 'flex', overflowX: 'auto' }}>
          {/* Labels column */}
          <div
            className="labels-column"
            style={{ background: '#D9D9D9', minWidth: '200px', flexShrink: 0, position: 'relative' }}
          >
            {/* Add empty space to align with drag handle */}
            <div style={{ height: '30px', borderBottom: '1px solid #ddd' }} />

            {/* Labels */}
            {tableLabels.map((label, index) => (
              <div
                key={index}
                style={{
                  height: '56px',
                  padding: '0.75rem',
                  borderBottom: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <span>{label.label}</span>
                <CustomTooltip id={label.id} activeTooltip={activeTooltip} toggleTooltip={toggleTooltip}>
                  {formatTooltipContent(t(`tooltips.${label.id}`))}
                </CustomTooltip>
              </div>
            ))}
          </div>

          {/* Droppable area for columns */}
          <Droppable droppableId="droppable-columns" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  display: 'flex',
                  flexGrow: 1,
                  border: '1px solid #dee2e6',
                  borderLeft: 'none',
                }}
              >
                {columns.map((column, index) => (
                  <QueryCreationTableColumn
                    key={column.id}
                    data={column}
                    id={`query-column-${column.id}`}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
      <div className="mt-3">
        <FormGroup className="d-flex align-items-center">
          <div className="d-flex align-items-center" style={{ position: 'relative' }}>
            <CustomInput
              type="switch"
              id="distinct"
              label={t('queryBuilder.distinctL')}
              checked={distinct}
              onChange={() => dispatch(switchDistinct())}
            />
            <CustomTooltip
              id="distinct-switch"
              activeTooltip={activeTooltip}
              toggleTooltip={toggleTooltip}
              position="top"
            >
              {formatTooltipContent(t('tooltips.distinct'))}
            </CustomTooltip>
          </div>

          <div className="d-flex align-items-center ml-2 mr-2" style={{ position: 'relative' }}>
            <CustomInput
              type="switch"
              id="limit_switch"
              label={t('queryBuilder.limitL')}
              checked={limit}
              onChange={() => dispatch(switchLimit())}
            />
            <CustomTooltip id="limit-switch" activeTooltip={activeTooltip} toggleTooltip={toggleTooltip} position="top">
              {formatTooltipContent(t('tooltips.limit'))}
            </CustomTooltip>
          </div>

          {limit && (
            <InputGroup className="w-auto" size="sm">
              <Input
                id="limit"
                placeholder="Value"
                value={limitValue || ''}
                min={0}
                max={999}
                type="number"
                step="1"
                onChange={(e) => dispatch(setLimitValue(parseInt(e.target.value, 10)))}
              />
              <CustomTooltip
                id="limit-value"
                activeTooltip={activeTooltip}
                toggleTooltip={toggleTooltip}
                position="top"
              >
                {formatTooltipContent(t('tooltips.limit-value'))}
              </CustomTooltip>

              <div className="d-flex align-items-center ml-2" style={{ position: 'relative' }}>
                <CustomInput
                  type="switch"
                  id="ties_switch"
                  label={t('queryBuilder.withTiesL')}
                  checked={withTies}
                  onChange={() => dispatch(switchTies())}
                />
                <CustomTooltip
                  id="ties-switch"
                  activeTooltip={activeTooltip}
                  toggleTooltip={toggleTooltip}
                  position="top"
                >
                  {formatTooltipContent(t('tooltips.with-ties'))}
                </CustomTooltip>
              </div>
            </InputGroup>
          )}
        </FormGroup>
      </div>
    </div>
  );
};

export default QueryCreationTable;

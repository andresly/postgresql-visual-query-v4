import React, { memo, useEffect, useState, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  Edge,
  EdgeProps,
  Position,
  SimpleBezierEdge,
} from '@xyflow/react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { useAppDispatch } from '../hooks';
import { removeJoin, updateJoin } from '../actions/queryActions';
import { ReactComponent as LeftJoinIcon } from '../assets/icons/left-join.svg';
import { ReactComponent as RightJoinIcon } from '../assets/icons/right-join.svg';
import { ReactComponent as InnerJoinIcon } from '../assets/icons/inner-join.svg';
import { ReactComponent as OuterJoinIcon } from '../assets/icons/outer-join.svg';
import { ReactComponent as CorssJoinIcon } from '../assets/icons/cross-join.svg';
import { JoinType, JoinConditionType } from '../types/queryTypes';
import _ from 'lodash';

interface JoinEdgeData {
  join: JoinType;
  condition: JoinConditionType;
  mainTable: string;
  secondaryTable: string;
  sourceColumn: string;
  targetColumn: string;
  joinId?: number;
}

// Enhanced JoinEdge component for displaying join relationships
function JoinEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const dispatch = useAppDispatch();
  const { setEdges } = useReactFlow();
  const [currentJoinType, setCurrentJoinType] = useState<string>('inner');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Extract join data from the edge
  const typedData = data as JoinEdgeData | undefined;
  const join = typedData?.join || { type: 'inner', id: 0, color: '#000000', main_table: {}, conditions: [] };
  const mainTable = typedData?.mainTable || 'Table';
  const secondaryTable = typedData?.secondaryTable || 'Table';
  const sourceColumn = typedData?.sourceColumn || 'column';
  const targetColumn = typedData?.targetColumn || 'column';

  // Update the current join type when it changes
  useEffect(() => {
    if (join && join.type) {
      setCurrentJoinType(join.type);
    }
  }, [join]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle join type change
  const handleUpdateJoinType = (type: string) => {
    if (join && typeof join.id !== 'undefined') {
      // Deep clone the join to avoid reference issues
      const updatedJoin = _.cloneDeep(join);
      // Update the type
      updatedJoin.type = type;

      // Update local state immediately for UI responsiveness
      setCurrentJoinType(type);

      dispatch(updateJoin(updatedJoin));
      setIsDropdownOpen(false);
    }
  };

  // Handle join removal
  const handleRemoveJoin = () => {
    if (join && typeof join.id !== 'undefined') {
      // Deep clone the join to avoid reference issues
      const clonedJoin = _.cloneDeep(join);
      dispatch(removeJoin(clonedJoin));

      // Remove the edge from React Flow
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, cursor: 'pointer' }}
        onClick={() => setIsDropdownOpen(true)}
        interactionWidth={40}
      />
      <EdgeLabelRenderer>
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            background: 'white',
            borderRadius: '4px',
            padding: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
          className="join-controls"
        >
          <UncontrolledDropdown isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(!isDropdownOpen)}>
            <DropdownToggle color="light" size="sm" className="join-type-button" style={{ padding: 0 }}>
              {currentJoinType === 'left' && <LeftJoinIcon style={{ width: '20px', height: '20px' }} />}
              {currentJoinType === 'right' && <RightJoinIcon style={{ width: '20px', height: '20px' }} />}
              {currentJoinType === 'inner' && <InnerJoinIcon style={{ width: '20px', height: '20px' }} />}
              {currentJoinType === 'outer' && <OuterJoinIcon style={{ width: '20px', height: '20px' }} />}
              {currentJoinType === 'cross' && <CorssJoinIcon style={{ width: '20px', height: '20px' }} />}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => handleUpdateJoinType('inner')} active={currentJoinType === 'inner'}>
                Select only matching rows from <strong>{mainTable}</strong> and <strong>{secondaryTable}</strong> (Inner
                Join)
              </DropdownItem>
              <DropdownItem onClick={() => handleUpdateJoinType('left')} active={currentJoinType === 'left'}>
                Select all rows from <strong>{mainTable}</strong>, matching rows from <strong>{secondaryTable}</strong>{' '}
                (Left Join)
              </DropdownItem>
              <DropdownItem onClick={() => handleUpdateJoinType('right')} active={currentJoinType === 'right'}>
                Select all rows from <strong>{secondaryTable}</strong>, matching rows from <strong>{mainTable}</strong>{' '}
                (Right Join)
              </DropdownItem>
              <DropdownItem onClick={() => handleUpdateJoinType('outer')} active={currentJoinType === 'outer'}>
                Select all rows from both <strong>{mainTable}</strong> and <strong>{secondaryTable}</strong> (Full join)
              </DropdownItem>
              <DropdownItem onClick={() => handleUpdateJoinType('cross')} active={currentJoinType === 'cross'}>
                Combine every row from <strong>{mainTable}</strong> with every row from{' '}
                <strong>{secondaryTable}</strong> (Cross Join)
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem className="text-danger" onClick={handleRemoveJoin}>
                Delete Join
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(JoinEdge);

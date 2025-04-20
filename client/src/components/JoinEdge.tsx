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
import { useClickAway } from 'react-use';

interface JoinEdgeData {
  join: JoinType;
  condition: JoinConditionType;
  mainTable: string;
  secondaryTable: string;
  sourceColumn: string;
  targetColumn: string;
  joinId?: number;
  isActive?: boolean;
  setIsActiveNull?: () => void;
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
  markerStart,
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
  const isActive = typedData?.isActive || false;
  const setIsActiveNull = typedData?.setIsActiveNull;

  // Update the current join type when it changes
  useEffect(() => {
    if (join && join.type) {
      setCurrentJoinType(join.type);
    }
  }, [join]);

  // Open dropdown when isActive changes to true
  useEffect(() => {
    if (isActive) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [isActive]);

  // Toggle dropdown manually
  const toggleDropdown = (e?: React.MouseEvent) => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle join type change
  const handleUpdateJoinType = (type: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    if (join && typeof join.id !== 'undefined') {
      // Deep clone the join to avoid reference issues
      const updatedJoin = _.cloneDeep(join);
      // Update the type
      updatedJoin.type = type;

      // Update local state immediately for UI responsiveness
      setCurrentJoinType(type);
      dispatch(updateJoin(updatedJoin));

      // Close the dropdown immediately
      setIsDropdownOpen(false);
      setIsActiveNull && setIsActiveNull();
    }
  };

  // Handle join removal
  const handleRemoveJoin = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling

    if (join && typeof join.id !== 'undefined') {
      // Deep clone the join to avoid reference issues
      const clonedJoin = _.cloneDeep(join);
      dispatch(removeJoin(clonedJoin));

      // Remove the edge from React Flow
      setEdges((edges) => edges.filter((edge) => edge.id !== id));

      // Reset active edge and close dropdown
      setIsDropdownOpen(false);
      setIsActiveNull && setIsActiveNull();
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          cursor: 'pointer',
          // strokeDasharray: 'none',
          strokeWidth: 2,
        }}
        interactionWidth={40}
        onClick={(e) => {
          toggleDropdown(e);
        }}
      />
      <EdgeLabelRenderer>
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            zIndex: 10001,
            pointerEvents: 'all',
            background: 'rgba(255, 255, 255, 0.95)',
          }}
          className="join-controls"
          id={`join-label-${id}`}
        >
          {isDropdownOpen && (
            <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 10001 }}>
              <button
                className="dropdown-item"
                type="button"
                onClick={(e) => handleUpdateJoinType('inner', e)}
                style={currentJoinType === 'inner' ? { backgroundColor: '#007bff', color: 'white' } : {}}
              >
                Select only matching rows from <strong>{mainTable}</strong> and <strong>{secondaryTable}</strong> (Inner
                Join)
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={(e) => handleUpdateJoinType('left', e)}
                style={currentJoinType === 'left' ? { backgroundColor: '#007bff', color: 'white' } : {}}
              >
                Select all rows from <strong>{mainTable}</strong>, matching rows from <strong>{secondaryTable}</strong>{' '}
                (Left Join)
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={(e) => handleUpdateJoinType('right', e)}
                style={currentJoinType === 'right' ? { backgroundColor: '#007bff', color: 'white' } : {}}
              >
                Select all rows from <strong>{secondaryTable}</strong>, matching rows from <strong>{mainTable}</strong>{' '}
                (Right Join)
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={(e) => handleUpdateJoinType('outer', e)}
                style={currentJoinType === 'outer' ? { backgroundColor: '#007bff', color: 'white' } : {}}
              >
                Select all rows from both <strong>{mainTable}</strong> and <strong>{secondaryTable}</strong> (Full join)
              </button>
              <button
                className="dropdown-item"
                type="button"
                onClick={(e) => handleUpdateJoinType('cross', e)}
                style={currentJoinType === 'cross' ? { backgroundColor: '#007bff', color: 'white' } : {}}
              >
                Combine every row from <strong>{mainTable}</strong> with every row from{' '}
                <strong>{secondaryTable}</strong> (Cross Join)
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item text-danger" type="button" onClick={handleRemoveJoin}>
                Delete Join
              </button>
            </div>
          )}
        </div>
        {/*</div>*/}
      </EdgeLabelRenderer>
    </>
  );
}

export default JoinEdge;

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { useAppDispatch } from '../hooks';
import { removeJoin, updateJoin } from '../actions/queryActions';
import { ReactComponent as LeftJoinIcon } from '../assets/icons/left-join.svg';
import { ReactComponent as RightJoinIcon } from '../assets/icons/right-join.svg';
import { ReactComponent as InnerJoinIcon } from '../assets/icons/inner-join.svg';
import { ReactComponent as OuterJoinIcon } from '../assets/icons/outer-join.svg';
import { ReactComponent as CorssJoinIcon } from '../assets/icons/cross-join.svg';

// Simple JoinEdge component for displaying join relationships
function JoinEdge(props: any) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data } = props;

  const dispatch = useAppDispatch();
  const { setEdges } = useReactFlow();

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
  const join = data?.join || { type: 'inner' };
  const mainTable = data?.mainTable || 'Table';
  const secondaryTable = data?.secondaryTable || 'Table';

  // Get the appropriate icon based on join type
  const getJoinIcon = () => {
    const iconStyle = { width: '20px', height: '20px' };

    switch (join?.type) {
      case 'left':
        return <LeftJoinIcon style={iconStyle} />;
      case 'right':
        return <RightJoinIcon style={iconStyle} />;
      case 'outer':
        return <OuterJoinIcon style={iconStyle} />;
      case 'cross':
        return <CorssJoinIcon style={iconStyle} />;
      case 'inner':
      default:
        return <InnerJoinIcon style={iconStyle} />;
    }
  };

  // Handle join type change
  const handleJoinTypeChange = (type: string) => {
    if (join && join.id) {
      dispatch(updateJoin({ ...join, type }));
    }
  };

  // Handle join removal
  const handleRemoveJoin = () => {
    if (join && join.id) {
      dispatch(removeJoin(join));

      // Remove the edge from React Flow
      setEdges((edges: any) => edges.filter((edge: any) => edge.id !== id));
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
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
          <UncontrolledDropdown>
            <DropdownToggle color="light" size="sm" className="join-type-button">
              {getJoinIcon()}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => handleJoinTypeChange('inner')} active={join?.type === 'inner'}>
                Inner Join
              </DropdownItem>
              <DropdownItem onClick={() => handleJoinTypeChange('left')} active={join?.type === 'left'}>
                Left Join
              </DropdownItem>
              <DropdownItem onClick={() => handleJoinTypeChange('right')} active={join?.type === 'right'}>
                Right Join
              </DropdownItem>
              <DropdownItem onClick={() => handleJoinTypeChange('outer')} active={join?.type === 'outer'}>
                Full Join
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

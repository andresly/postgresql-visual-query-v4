import React from 'react';
import { NodeProps } from '@xyflow/react';
import QueryTable from './QueryTable';
import { QueryTableType } from '../types/queryTypes';

// TableNode component for displaying database tables in flow diagram
function TableNode({ data }: any) {
  // Extract data from the node
  const { table, index, isDraggable } = data || { table: {}, index: 0, isDraggable: false };

  return (
    <div className="table-node">
      {isDraggable && (
        <div className="table-drag-handle">
          <i className="fa fa-arrows-alt mr-2" /> Drag to move
        </div>
      )}

      {/* Render the actual table content */}
      <QueryTable key={`query-table-${index}-${table.id}`} id={`query-table-${index}`} data={table} isFlowNode />
    </div>
  );
}

export default TableNode;

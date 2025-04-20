import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import { translations } from '../utils/translations';
import QueryTable from '../components/QueryTable';
import QueryTabs from '../components/QueryTabs';
import QueryButton from '../components/QueryButton';
import DownloadSQLButton from '../components/DownloadSQLButton';
import DownloadCSVButton from '../components/DownloadCSVButton';
import ResultTabs from '../components/ResultTabs';
import LanguageSwitcher from '../components/LanguageSwitcher';
import DisconnectButton from '../components/DisconnectButton';
import SchemaSelector from '../components/SchemaSelector';
import SearchBar from '../components/SearchBar';
import DatabaseViewer from '../components/DatabaseViewer';
// eslint-disable-next-line import/no-named-as-default-member
import NavBar from '../components/NavBar';
import DndIntegration from '../components/DndIntegration';
import TableView from '../components/TableView';
import { useAppSelector, useAppDispatch } from '../hooks';
import { LanguageType } from '../types/settingsType';
import { QueryTableType, QueryType, JoinType, JoinConditionType } from '../types/queryTypes';
import { addJoin, updateJoin } from '../actions/queryActions';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/grid-layout.css';
import '../styles/reactflow.css';
import _ from 'lodash';

// XY Flow imports
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Connection,
  NodeTypes as ReactFlowNodeTypes,
  EdgeTypes as ReactFlowEdgeTypes,
  Edge as ReactFlowEdge,
  MarkerType,
  applyNodeChanges,
  NodeChange,
  Node,
  EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Node and Edge components
import TableNode from '../components/TableNode';
// @ts-ignore - component will be created later
import JoinEdge from '../components/JoinEdge';

interface SideBarProps {
  language: LanguageType;
}

export const SideBar: React.FC<SideBarProps> = ({ language }) => (
  <div className="d-flex flex-column w-100">
    <div className="">
      <LanguageSwitcher />
      <DisconnectButton />
    </div>
    <SchemaSelector />
    <SearchBar />
    <h5 className="mt-2">{translations[language.code].sideBar.tablesH}</h5>
    <div className="d-flex flex-fill">
      <DatabaseViewer />
    </div>
  </div>
);

interface TableTypeWrapperProps {
  index: number;
  children: React.ReactNode;
}

export const TableTypeWrapper: React.FC<TableTypeWrapperProps> = ({ index, children }) => (
  <div className="d-inline-flex">
    <div className={`d-flex flex-column m-2 border ${index === 0 ? 'border-success' : 'border-danger'}`}>
      <h6 className={`text-center ${index === 0 ? 'text-success' : 'text-danger'}`}>
        {index === 0 ? 'MAIN TABLE' : 'JOIN'}
      </h6>
      {children}
    </div>
  </div>
);

interface GridItemData {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tableId: number;
}

interface QueryBuilderProps {
  language: LanguageType;
  tables: QueryTableType[];
  queryValid: boolean;
  queryType: string;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ language, tables, queryValid, queryType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  // Get joins data from redux state
  const joins = useAppSelector((state) => state.query.joins);

  // Track active edge ID
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  // Container dimensions
  const [containerWidth, setContainerWidth] = useState(1200);

  // React Flow states with TypeScript errors bypassed
  // @ts-ignore - bypass TypeScript errors for node state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // @ts-ignore - bypass TypeScript errors for edge state
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Define node types and edge types
  const nodeTypes = { tableNode: TableNode } as ReactFlowNodeTypes;
  const edgeTypes = { joinEdge: JoinEdge } as ReactFlowEdgeTypes;

  // Grid configuration for positioning nodes
  const gridConfig = {
    defaultHeight: 300,
    defaultWidth: 250,
    verticalSpacing: 200,
    horizontalSpacing: 300,
  };

  // Custom onNodesChange handler to save positions to sessionStorage
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // @ts-ignore - bypass type error between React Flow's node types and setState
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);

        // Save to sessionStorage
        sessionStorage.setItem('flow-positions', JSON.stringify(updated));

        return updated;
      });
    },
    [setNodes],
  );

  function parseHandleId(handleId: string) {
    // Match the structure: tableId-columnName-side-type
    // Find last 2 parts (e.g. 'left' + 'target') then pull out the rest as column name
    const parts = handleId.split('-');
    const tableId = parseInt(parts[0], 10);
    const handleType = parts[parts.length - 1]; // source/target
    const side = parts[parts.length - 2] as 'left' | 'right'; // left/right
    const columnName = parts.slice(1, parts.length - 2).join('-'); // support dash in column names

    return { tableId, columnName, side, handleType };
  }

  // Update container dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        setContainerWidth(newWidth);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Create nodes from tables
  useEffect(() => {
    if (tables.length === 0) {
      setNodes([]);
      return;
    }

    // Try to load saved positions from sessionStorage
    const saved = sessionStorage.getItem('flow-positions');
    let savedPositions: Node[] = [];

    if (saved) {
      try {
        savedPositions = JSON.parse(saved);
      } catch (e) {
        console.warn('Invalid saved positions');
      }
    }

    // Calculate how many tables per row
    const tablesPerRow = Math.floor(containerWidth / gridConfig.horizontalSpacing);

    // Create nodes for each table
    const newNodes = tables.map((table, index) => {
      // Check if we have a saved position for this table
      const savedNode = savedPositions.find((n) => n.id === `table-${table.id}`);

      return {
        id: `table-${table.id}`,
        type: 'tableNode',
        position: savedNode?.position || {
          x: (index % tablesPerRow) * gridConfig.horizontalSpacing + 50,
          y: Math.floor(index / tablesPerRow) * gridConfig.verticalSpacing + 50,
        },
        data: {
          table,
          index,
          isDraggable: !['DELETE', 'UPDATE'].includes(queryType),
        },
        draggable: !['DELETE', 'UPDATE'].includes(queryType),
      };
    });

    // @ts-ignore - bypass TypeScript for node type assignment
    setNodes(newNodes);
  }, [tables, containerWidth, queryType, setNodes]);

  const getMarker = (joinType: string, isSource: boolean): { markerStart?: any; markerEnd?: any } => {
    const marker = {
      type: MarkerType.ArrowClosed,
      color: 'black',
    };

    switch (joinType) {
      case 'inner':
      case 'cross':
        return {
          markerStart: marker,
          markerEnd: marker,
        };
      case 'left':
        return isSource
          ? { markerEnd: marker } // from left → right
          : { markerStart: marker }; // reverse edge (optional)
      case 'right':
        return isSource
          ? { markerStart: marker } // from right → left
          : { markerEnd: marker }; // normal edge
      default:
        return {
          markerEnd: marker,
        };
    }
  };

  // Create edges from joins when page loads or joins update
  useEffect(() => {
    if (!joins || joins.length === 0) {
      return;
    }

    // Create edges for all existing joins
    const newEdges = joins.flatMap((join: JoinType): ReactFlowEdge[] => {
      return join.conditions.map((condition, condIndex) => {
        // Create source and target handles for the specific columns
        const sourceId = `table-${condition.main_table.id}`;
        const targetId = `table-${condition.secondary_table.id}`;
        const sourceSide = condition.main_table.joinHandleSide || 'right';
        const targetSide = condition.secondary_table.joinHandleSide || 'left';
        const sourceHandle = `${condition.main_table.id}-${condition.main_column}-${sourceSide}-source`;
        const targetHandle = `${condition.secondary_table.id}-${condition.secondary_column}-${targetSide}-target`;
        const isSourceLeftToRight = sourceSide === 'right' && targetSide === 'left';
        const markerConfig = getMarker(join.type, isSourceLeftToRight);
        // Create a unique edge ID
        const edgeId = `join-${join.id}-${condIndex}`;

        return {
          id: edgeId,
          source: sourceId,
          target: targetId,
          style: {
            stroke: 'black',
            strokeWidth: 3,
          },
          sourceHandle,
          targetHandle,
          type: 'joinEdge',
          animated: true,
          ...markerConfig,
          data: {
            isLabelOpen: true,
            join,
            condition,
            mainTable: condition.main_table.table_name,
            secondaryTable: condition.secondary_table.table_name,
            sourceColumn: condition.main_column,
            targetColumn: condition.secondary_column,
            isActive: edgeId === activeEdgeId,
            setIsActiveNull: () => {
              setActiveEdgeId(null);
            },
          },
        };
      });
    });

    // Set the edges with the newly created ones
    // @ts-ignore - bypass TypeScript for edge type assignment
    setEdges(newEdges);
  }, [joins, setEdges, tables, activeEdgeId]);

  // Handle new connections
  const onConnect = (params: Connection) => {
    // Extract table and column IDs from the source and target handles
    const sourceHandleId = params.sourceHandle;
    const targetHandleId = params.targetHandle;

    if (sourceHandleId && targetHandleId) {
      // Extract table and column IDs from the handles
      // Format is expected to be like "{tableId}-{columnName}-right" or "{tableId}-{columnName}-left"
      let source = parseHandleId(sourceHandleId);
      let target = parseHandleId(targetHandleId);

      if (source.tableId === target.tableId) {
        return;
      }

      if (source && target) {
        const sourceTableId = source.tableId;
        const targetTableId = target.tableId;
        let sourceColumnName = source.columnName;
        let targetColumnName = target.columnName;

        // Find source and target tables from the table list
        let sourceTable = tables.find((table) => table.id === sourceTableId);
        let targetTable = tables.find((table) => table.id === targetTableId);

        if (!sourceTable || !targetTable) return;

        // Create a new join between these columns
        const newJoin: JoinType = {
          id: joins.length,
          type: 'inner',
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
          main_table: {
            id: sourceTable.id,
            table_schema: sourceTable.table_schema,
            table_name: sourceTable.table_name,
            table_alias: sourceTable.table_alias,
            table_type: sourceTable.table_type,
            columns: sourceTable.columns,
          },
          conditions: [
            {
              id: 0,
              main_column: sourceColumnName,
              main_table: {
                joinHandleSide: source.side,
                id: sourceTable.id,
                table_schema: sourceTable.table_schema,
                table_name: sourceTable.table_name,
                table_alias: sourceTable.table_alias,
                table_type: sourceTable.table_type,
                columns: sourceTable.columns,
              },
              secondary_column: targetColumnName,
              secondary_table: {
                joinHandleSide: target.side,
                id: targetTable.id,
                table_schema: targetTable.table_schema,
                table_name: targetTable.table_name,
                table_type: targetTable.table_type,
                table_alias: targetTable.table_alias,
                columns: targetTable.columns,
              },
            },
          ],
        };

        // Clone the join object to avoid reference issues
        const join = _.cloneDeep(newJoin);

        // Add the edge to React Flow for visualization with the join data
        // @ts-ignore - bypass TypeScript for edge type in addEdge

        setEdges((eds) =>
          addEdge(
            {
              ...params,
              id: `join-${join.id}-0`,
              type: 'joinEdge',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
              data: {
                isLabelOpen: true,
                join,
                condition: join.conditions[0],
                mainTable: sourceTable?.table_name,
                secondaryTable: targetTable?.table_name,
                sourceColumn: source.columnName,
                targetColumn: target.columnName,
              },
            },
            eds,
          ),
        );

        // Add the join first
        dispatch(addJoin(join, true));

        // Then update it to ensure it's properly registered
        dispatch(updateJoin(join));
      }
    }

    // Highlight edges after connection
    // highlightEdges();
  };

  return (
    <div className="mt-0 pr-2">
      <NavBar language={language} queryType={queryType} />
      <div ref={containerRef} className="grid-container">
        <div style={{ width: '100%', height: '50vh', border: '1px solid #ddd', borderRadius: '4px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            zoomOnScroll={true}
            minZoom={0.2}
            maxZoom={1}
            defaultViewport={{ x: -100, y: 0, zoom: 0.2 }}
            proOptions={{ hideAttribution: true }}
            className="react-flow-container"
            onEdgeClick={(event, clickedEdge) => {
              event.stopPropagation();
              setActiveEdgeId((clickedEdge as any).id);
            }}
          >
            <Controls />
            <Background gap={16} color="#f8f8f8" />
            <MiniMap zoomable pannable />

            <Panel position="top-right">
              <div className="p-2 bg-light border rounded">
                <small>Drag to connect tables | Scroll to zoom</small>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Display fixed tables for DELETE/UPDATE queries */}
        {['DELETE', 'UPDATE'].includes(queryType) && (
          <div className="fixed-tables mt-3">
            {tables.map((table, index) => (
              <div key={`fixed-table-${table.id}`}>
                <TableTypeWrapper index={index}>
                  <QueryTable key={`query-table-${index}-${table.id}`} id={`query-table-${index}`} data={table} />
                </TableTypeWrapper>
              </div>
            ))}
          </div>
        )}
      </div>
      <QueryTabs />
      <div className="my-2">
        <QueryButton />

        {tables.length ? (
          <>
            <DownloadSQLButton />
            <DownloadCSVButton />
          </>
        ) : null}
      </div>
      {!queryValid && (
        <Alert color="danger" className="w-25">
          {translations[language.code].queryBuilder.invalidQuery}
        </Alert>
      )}
      <ResultTabs />
    </div>
  );
};

export const QueryPage: React.FC = () => {
  const { tables, queryValid, queryType } = useAppSelector((state) => state.query);
  const language = useAppSelector((state) => state.settings.language);
  const { activeTableId } = useAppSelector((state) => state.tableView);

  const queries = useAppSelector((state) => {
    return [...state.queries, state.query]
      .slice()
      .sort((query1: QueryType, query2: QueryType) => query1.id - query2.id);
  });

  return (
    <Container fluid>
      <Row>
        <Col sm="2" className="py-2 vh-100 d-flex bg-light">
          <SideBar language={language} />
        </Col>
        <Col sm="10" className="pr-0">
          <Scrollbars>
            {activeTableId === null ? (
              <QueryBuilder queryValid={queryValid} language={language} tables={tables} queryType={queryType} />
            ) : (
              <div className="mt-0 pr-2">
                <NavBar language={language} queryType={queryType} />
                <TableView tableId={activeTableId} />
              </div>
            )}
          </Scrollbars>
        </Col>
      </Row>
    </Container>
  );
};

export default QueryPage;

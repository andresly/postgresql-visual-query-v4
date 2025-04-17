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
import { QueryTableType, QueryType, JoinType } from '../types/queryTypes';
import { addJoin } from '../actions/queryActions';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/grid-layout.css';
import '../styles/reactflow.css';

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

  // Container dimensions
  const [containerWidth, setContainerWidth] = useState(1200);
  const [containerHeight, setContainerHeight] = useState(600);

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

  // Helper function to highlight edges after actions
  const highlightEdges = (duration = 1000) => {
    const flowElement = document.querySelector('.react-flow');
    if (flowElement) {
      flowElement.classList.add('edge-highlight');
      setTimeout(() => {
        flowElement.classList.remove('edge-highlight');
      }, duration);
    }
  };

  // Update container dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        const newHeight = window.innerHeight * 0.7; // 70% of viewport height
        setContainerWidth(newWidth);
        setContainerHeight(newHeight);
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

    // Calculate how many tables per row
    const tablesPerRow = Math.floor(containerWidth / gridConfig.horizontalSpacing);

    // Create nodes for each table
    const newNodes = tables.map((table, index) => {
      // Calculate position
      const row = Math.floor(index / tablesPerRow);
      const col = index % tablesPerRow;

      return {
        id: `table-${table.id}`,
        type: 'tableNode',
        position: {
          x: col * gridConfig.horizontalSpacing + 50,
          y: row * gridConfig.verticalSpacing + 50,
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

  // Create edges from joins
  useEffect(() => {
    if (!joins || joins.length === 0) {
      setEdges([]);
      return;
    }

    // Create edges from column join relationships
    const newEdges = joins.flatMap((join: JoinType) => {
      return join.conditions.map((condition, condIndex) => {
        // Create source and target handles for the specific columns
        const sourceId = `table-${join.main_table.id}`;
        const targetId = `table-${condition.secondary_table.id}`;
        const sourceHandle = `${join.main_table.id}-${condition.main_column}-right`;
        const targetHandle = `${condition.secondary_table.id}-${condition.secondary_column}-left`;

        // Create a unique edge ID
        const edgeId = `join-${join.id}-${condIndex}`;

        return {
          id: edgeId,
          source: sourceId,
          target: targetId,
          sourceHandle,
          targetHandle,
          type: 'joinEdge',
          data: {
            join,
            condition,
            mainTable: join.main_table.table_name,
            secondaryTable: condition.secondary_table.table_name,
            sourceColumn: condition.main_column,
            targetColumn: condition.secondary_column,
          },
        };
      });
    });

    // @ts-ignore - bypass TypeScript for edge type assignment
    setEdges(newEdges);
  }, [joins, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      // Extract table and column IDs from the source and target handles
      const sourceHandleId = params.sourceHandle;
      const targetHandleId = params.targetHandle;

      if (sourceHandleId && targetHandleId) {
        // Extract table and column IDs from the handles
        // Format is expected to be like "{tableId}-{columnName}-right" or "{tableId}-{columnName}-left"
        const sourceHandleParts = sourceHandleId.split('-');
        const targetHandleParts = targetHandleId.split('-');

        if (sourceHandleParts.length >= 2 && targetHandleParts.length >= 2) {
          const sourceTableId = parseInt(sourceHandleParts[0], 10);
          const sourceColumnName = sourceHandleParts[1];
          const targetTableId = parseInt(targetHandleParts[0], 10);
          const targetColumnName = targetHandleParts[1];

          // Find source and target tables from the table list
          const sourceTable = tables.find((table) => table.id === sourceTableId);
          const targetTable = tables.find((table) => table.id === targetTableId);

          if (sourceTable && targetTable) {
            // Create a new join between these columns
            const newJoin = {
              id: joins.length,
              type: 'inner',
              color: '#' + Math.floor(Math.random() * 16777215).toString(16),
              main_table: {
                id: sourceTable.id,
                table_schema: sourceTable.table_schema,
                table_name: sourceTable.table_name,
                table_alias: sourceTable.table_alias,
                table_type: sourceTable.table_type,
                columns: sourceTable.columns || [],
              },
              conditions: [
                {
                  id: 0,
                  main_column: sourceColumnName,
                  main_table: {
                    id: sourceTable.id,
                    table_schema: sourceTable.table_schema,
                    table_name: sourceTable.table_name,
                    table_alias: sourceTable.table_alias,
                    table_type: sourceTable.table_type,
                    columns: sourceTable.columns || [],
                  },
                  secondary_table: {
                    id: targetTable.id,
                    table_schema: targetTable.table_schema,
                    table_name: targetTable.table_name,
                    table_alias: targetTable.table_alias,
                    table_type: targetTable.table_type,
                    columns: targetTable.columns || [],
                  },
                  secondary_column: targetColumnName,
                },
              ],
            };

            // Dispatch action to add the join
            dispatch(addJoin(newJoin));
          }
        }
      }

      // Add the edge to React Flow for visualization
      // @ts-ignore - bypass TypeScript for edge type in addEdge
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'joinEdge',
            animated: true,
          },
          eds,
        ),
      );

      // Highlight edges after connection
      highlightEdges();
    },
    [tables, joins, dispatch, setEdges],
  );

  return (
    <div className="mt-0 pr-2">
      <NavBar language={language} queryType={queryType} />
      <div ref={containerRef} className="grid-container">
        <DndIntegration>
          <div style={{ width: '100%', height: containerHeight, border: '1px solid #ddd', borderRadius: '4px' }}>
            {/* @ts-ignore - Ignore TypeScript error for ReactFlow component */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              minZoom={0.2}
              maxZoom={2}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              proOptions={{ hideAttribution: true }}
              className="react-flow-container"
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
        </DndIntegration>
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

import React, { useState, useRef, useEffect } from 'react';
import { Alert, Col, Container, Row } from 'reactstrap';
import { Scrollbars } from 'react-custom-scrollbars';
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
import { ArcherContainer } from 'react-archer';
import TableView from '../components/TableView';
import { useAppSelector, useAppDispatch } from '../hooks';
import { LanguageType } from '../types/settingsType';
import { QueryTableType, QueryType } from '../types/queryTypes';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/grid-layout.css';

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
  const archerContainerRef = useRef<any>(null);
  const lastLayoutRef = useRef<GridItemData[]>([]);

  // Add state for container width
  const [containerWidth, setContainerWidth] = useState(1200);

  // Configuration options for table sizes
  const gridConfig = {
    defaultWidth: 2, // Default table width (in grid units) - smaller to fit more tables
    defaultHeight: 3, // Default table height (in grid units) - smaller to match width
    columnsPerRow: 6, // Increased from 4 to 6 tables per row
    horizontalSpacing: 2, // Reduced spacing to fit more tables
    verticalSpacing: 2, // Reduced vertical spacing to match horizontal
    maxWidth: 300, // Maximum width in pixels for a table
  };

  // State to store the layout of the grid items
  const [layout, setLayout] = useState<GridItemData[]>([]);

  // Helper function to refresh arrows with a slight delay
  const refreshArrows = (delay = 100) => {
    if (archerContainerRef.current) {
      setTimeout(() => {
        archerContainerRef.current.refreshScreen();
      }, delay);

      // Add a second refresh for edge cases where tables snap back
      setTimeout(() => {
        archerContainerRef.current.refreshScreen();
      }, delay + 200);
    }
  };

  // Remove the dragging class from archer container
  const removeDraggingClass = () => {
    const archerElement = document.querySelector('.archer-container');
    if (archerElement) {
      archerElement.classList.remove('dragging-in-progress');

      // Force an immediate re-render of arrows with a slight delay
      refreshArrows(50);

      // Highlight the arrows after finished dragging
      setTimeout(() => {
        archerElement.classList.add('arrow-highlight');
        setTimeout(() => {
          archerElement.classList.remove('arrow-highlight');
        }, 1000);
      }, 100);
    }
  };

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth;
        setContainerWidth(newWidth);

        // Calculate maximum table width in grid units
        // to ensure no table exceeds maxWidth pixels
        if (newWidth > 0) {
          // Calculate column width based on the GridLayout properties
          const colWidth = (newWidth - 11 * 10) / 12; // (containerWidth - (cols-1)*margin) / cols
          const maxGridUnits = Math.floor(gridConfig.maxWidth / colWidth);

          // If tables are too wide, update their width in the layout
          if (layout.length > 0 && maxGridUnits < gridConfig.defaultWidth) {
            const updatedLayout = layout.map((item) => ({
              ...item,
              w: Math.min(item.w, maxGridUnits),
            }));
            setLayout(updatedLayout);
          }
        }
      }
    };

    // Initial measurement
    updateWidth();

    // Add resize listener
    window.addEventListener('resize', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [layout]);

  // Calculate initial grid layout based on tables
  useEffect(() => {
    if (tables.length === 0) {
      setLayout([]);
      return;
    }

    // Create a layout config for each table
    const newLayout = tables.map((table, index) => {
      // Find existing layout if available
      const existingItem = layout.find((item) => item.i === `table-${table.id}`);

      if (existingItem) {
        return existingItem;
      }

      // Create a new grid item for this table with smaller width
      return {
        i: `table-${table.id}`,
        x: (index % gridConfig.columnsPerRow) * gridConfig.horizontalSpacing,
        y: Math.floor(index / gridConfig.columnsPerRow) * gridConfig.verticalSpacing,
        w: gridConfig.defaultWidth,
        h: gridConfig.defaultHeight,
        tableId: table.id,
      };
    });

    setLayout(newLayout);
  }, [tables.length]);

  // Handle when the grid layout changes (due to dragging)
  const handleLayoutChange = (newLayout: GridItemData[]) => {
    // Store the previous layout for comparison
    lastLayoutRef.current = layout;

    // Update the layout state
    setLayout(newLayout);

    // Check if any item has snapped back to its original position
    const hasItemSnappedBack = newLayout.some((item, index) => {
      const prevItem = lastLayoutRef.current.find((li) => li.i === item.i);
      if (!prevItem) return false;

      // Detect if an item has moved significantly and then reverted
      const hasMoved = Math.abs(prevItem.x - item.x) > 1 || Math.abs(prevItem.y - item.y) > 1;
      const hasReverted = item.x === prevItem.x && item.y === prevItem.y;

      return hasMoved && hasReverted;
    });

    // If any item has snapped back, refresh arrows and highlight them
    if (hasItemSnappedBack) {
      refreshArrows(150);

      // Add highlight class to show animations
      const archerElement = document.querySelector('.archer-container');
      if (archerElement) {
        archerElement.classList.add('arrow-highlight');
        setTimeout(() => {
          archerElement.classList.remove('arrow-highlight');
        }, 1000);
      }
    }
  };

  return (
    <div className="mt-0 pr-2">
      <NavBar language={language} queryType={queryType} />
      <div ref={containerRef} className="grid-container">
        <DndIntegration>
          <ArcherContainer
            ref={archerContainerRef}
            startMarker={false}
            endMarker
            strokeColor="rgba(0,0,0)"
            strokeWidth={1}
            svgContainerStyle={{ zIndex: 100 }}
            noCurves
            offset={15}
            className="archer-container"
          >
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={100}
              width={containerWidth}
              margin={[10, 10]}
              compactType="vertical"
              preventCollision={false}
              maxRows={20}
              isDraggable
              isResizable
              onLayoutChange={handleLayoutChange}
              onDragStop={() => {
                // Force refresh arrows when dragging stops
                refreshArrows(100);
                removeDraggingClass();
              }}
              onResizeStop={(layoutParam, oldItem, newItem) => {
                // If a table exceeds max width, constrain it
                if (containerWidth > 0) {
                  const colWidth = (containerWidth - gridConfig.columnsPerRow * 2 * 10) / 12;
                  const maxGridUnits = Math.floor(gridConfig.maxWidth / colWidth);

                  if (newItem.w > maxGridUnits) {
                    // Find the corresponding item in our state
                    const currentLayout = [...layout];
                    const itemIndex = currentLayout.findIndex((item) => item.i === newItem.i);

                    if (itemIndex !== -1) {
                      // Update just this item's width
                      currentLayout[itemIndex] = {
                        ...currentLayout[itemIndex],
                        w: maxGridUnits,
                      };

                      // Set the updated layout
                      setLayout(currentLayout);
                    }
                  }
                }

                // Force refresh arrows when resizing stops
                refreshArrows(100);
              }}
              onDragStart={() => {
                // Apply a class to the archer container to indicate dragging
                const archerElement = document.querySelector('.archer-container');
                if (archerElement) {
                  archerElement.classList.add('dragging-in-progress');
                }
              }}
              draggableHandle=".table-drag-handle"
            >
              {tables.map((table, index) => {
                if (['DELETE', 'UPDATE'].includes(queryType)) {
                  return (
                    <div key={`fixed-table-${table.id}`}>
                      <TableTypeWrapper index={index}>
                        <QueryTable key={`query-table-${index}-${table.id}`} id={`query-table-${index}`} data={table} />
                      </TableTypeWrapper>
                    </div>
                  );
                }

                // Return a draggable grid item with the QueryTable inside
                return (
                  <div key={`table-${table.id}`} className="grid-item">
                    <div className="table-drag-handle">
                      <i className="fa fa-arrows-alt mr-2" /> Drag to move
                    </div>
                    <QueryTable key={`query-table-${index}-${table.id}`} id={`query-table-${index}`} data={table} />
                  </div>
                );
              })}
            </GridLayout>
          </ArcherContainer>
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

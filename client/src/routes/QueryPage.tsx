import React from 'react';
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
import DragDropWrapper from '../components/DragDropWrapper';
import { ArcherContainer } from 'react-archer';
import TableView from '../components/TableView';
import { useAppSelector } from '../hooks';
import { LanguageType } from '../types/settingsType';
import { QueryTableType, QueryType } from '../types/queryTypes';

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

interface QueryBuilderProps {
  language: LanguageType;
  tables: QueryTableType[];
  queryValid: boolean;
  queryType: string;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ language, tables, queryValid, queryType }) => {
  // Get the first table ID for QueryTable components that need it
  const firstTableId = tables.length > 0 ? tables[0].id : 0;

  return (
    <div className="mt-0 pr-2">
      <NavBar language={language} queryType={queryType} />
      <DragDropWrapper>
        <div style={{ minHeight: '40vh' }}>
          <ArcherContainer
            startMarker={false}
            endMarker
            strokeColor="rgba(0,0,0)"
            strokeWidth={1}
            svgContainerStyle={{ zIndex: 100 }}
            noCurves
            offset={15}
            className={'archer-container'}
          >
            {tables.map((table, index) => {
              if (['DELETE', 'UPDATE'].includes(queryType)) {
                return (
                  <TableTypeWrapper key={`table-wrapper-${index}`} index={index}>
                    <QueryTable key={`query-table-${index}-${table.id}`} id={`query-table-${index}`} data={table} />
                  </TableTypeWrapper>
                );
              }
              return <QueryTable key={`query-table-${index}-${table.id}`} id={`query-table-${index}`} data={table} />;
            })}
          </ArcherContainer>
        </div>
      </DragDropWrapper>
      <QueryTabs />
      <div className="my-2">
        {/* Pass as a derived prop rather than direct queryValid prop */}
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

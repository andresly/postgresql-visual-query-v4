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
import NavBar from '../components/NavBar';
import DragDropWrapper from '../components/DragDropWrapper';
import { ArcherContainer } from 'react-archer';

export const SideBar = (props) => (
  <div className="d-flex flex-column w-100">
    <div className="">
      <LanguageSwitcher />
      <DisconnectButton />
    </div>
    <SchemaSelector />
    <SearchBar />
    <h5 className="mt-2">{translations[props.language.code].sideBar.tablesH}</h5>
    <div className="d-flex flex-fill">
      <DatabaseViewer />
    </div>
  </div>
);

SideBar.propTypes = {
  language: PropTypes.shape({ code: PropTypes.string }),
};

export const TableTypeWrapper = (props) => (
  <div className="d-inline-flex">
    <div className={`d-flex flex-column m-2 border ${props.index === 0 ? 'border-success' : 'border-danger'}`}>
      <h6 className={`text-center ${props.index === 0 ? 'text-success' : 'text-danger'}`}>
        {props.index === 0 ? 'MAIN TABLE' : 'JOIN'}
      </h6>
      {props.children}
    </div>
  </div>
);

export const QueryBuilder = (props) => (
  <div className="mt-0 pr-2">
    <NavBar language={props.language} queryType={props.queryType} />
    <DragDropWrapper>
      <div style={{ minHeight: '40vh' }}>
        <ArcherContainer
          startMarker={false}
          endMarker={false}
          strokeColor="rgba(0,0,0)"
          strokeWidth={1}
          svgContainerStyle={{ zIndex: 100 }}
          noCurves
          className={'archer-container'}
        >
          {props.tables.map((table, index) => {
            if (['DELETE', 'UPDATE'].includes(props.queryType)) {
              return (
                <TableTypeWrapper
                  key={`table-wrapper-${index}`}
                  index={index}
                  children={
                    <QueryTable
                      key={`query-table-${index}-${table.id}`}
                      id={`query-table-${index}`}
                      data={table}
                      firstTableId={props.tables[0].id}
                    />
                  }
                />
              );
            }
            return (
              <QueryTable
                key={`query-table-${index}-${table.id}`}
                id={`query-table-${index}`}
                data={table}
                firstTableId={props.tables[0].id}
              />
            );
          })}
        </ArcherContainer>
      </div>
    </DragDropWrapper>
    <QueryTabs />
    <div className="my-2">
      <QueryButton queryValid={props.queryValid} />

      {props.tables.length ? (
        <>
          <DownloadSQLButton />
          <DownloadCSVButton />
        </>
      ) : null}
    </div>
    {!props.queryValid && (
      <Alert color="danger" className="w-25">
        {translations[props.language.code].queryBuilder.invalidQuery}
      </Alert>
    )}
    <ResultTabs />
  </div>
);

QueryBuilder.propTypes = {
  language: PropTypes.shape({ code: PropTypes.string }),
  tables: PropTypes.arrayOf(PropTypes.shape({})),
  queryValid: PropTypes.bool,
  queryType: PropTypes.string,
};

export const QueryPage = (props) => (
  <Container fluid>
    <Row>
      <Col sm="2" className="py-2 vh-100 d-flex bg-light">
        <SideBar language={props.language} />
      </Col>
      <Col sm="10" className="pr-0">
        <Scrollbars>
          <QueryBuilder
            queryValid={props.queryValid}
            language={props.language}
            tables={props.tables}
            activeQueryId={props.activeQueryId}
            queriesLength={props.queries.length}
            queryType={props.queryType}
          />
        </Scrollbars>
      </Col>
    </Row>
  </Container>
);

QueryPage.propTypes = {
  language: PropTypes.shape({ code: PropTypes.string }),
  tables: PropTypes.arrayOf(PropTypes.shape({})),
  activeQueryId: PropTypes.number,
  queryValid: PropTypes.bool,
  queries: PropTypes.arrayOf(PropTypes.shape({})),
};

const mapStateToProps = (store) => ({
  tables: store.query.tables,
  language: store.settings.language,
  queryValid: store.query.queryValid,
  activeQueryId: store.query.id,
  queries: store.queries,
  queryType: store.query.queryType,
});

export default connect(mapStateToProps)(QueryPage);

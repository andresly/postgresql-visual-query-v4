import React, { useState } from 'react';
import { Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import UsingList from './UsingList';
import { translations } from '../utils/translations';
import SetList from './SetList';
import NewQueryColumnList from './NewQueryColumnList';
import InsertQueryColumnList from './InsertQueryColumnList';
import UpdateQueryColumnList from './UpdateQueryColumnList';
import { QueryCreationTable } from './QueryCreationTable';

export const QueryTabs = (props) => {
  const [activeTab, setActiveTab] = useState('1');

  return (
    <div>
      {props.queryType === 'SELECT' && (
        <Nav tabs className="flex-row">
          <NavItem>
            <NavLink
              className={activeTab === '1' ? 'active' : ''}
              onClick={() => {
                setActiveTab('1');
              }}
            >
              {translations[props.language.code].queryBuilder.columnsH}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '3' ? 'active' : ''}
              onClick={() => {
                setActiveTab('3');
              }}
            >
              {translations[props.language.code].queryBuilder.setsH}
            </NavLink>
          </NavItem>
        </Nav>
      )}
      {props.queryType === 'DELETE' && (
        <Nav tabs className="flex-row">
          <NavItem>
            <NavLink
              className={activeTab === '1' ? 'active' : ''}
              onClick={() => {
                setActiveTab('1');
              }}
            >
              Filter
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '2' ? 'active' : ''}
              onClick={() => {
                setActiveTab('2');
              }}
            >
              Join
            </NavLink>
          </NavItem>
        </Nav>
      )}
      {props.queryType === 'INSERT' && (
        <Nav tabs className="flex-row">
          <NavItem>
            <NavLink
              className={activeTab === '1' ? 'active' : ''}
              onClick={() => {
                setActiveTab('1');
              }}
            >
              Values
            </NavLink>
          </NavItem>
        </Nav>
      )}
      {props.queryType === 'UPDATE' && (
        <Nav tabs className="flex-row">
          <NavItem>
            <NavLink
              className={activeTab === '1' ? 'active' : ''}
              onClick={() => {
                setActiveTab('1');
              }}
            >
              Set values
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '2' ? 'active' : ''}
              onClick={() => {
                setActiveTab('2');
              }}
            >
              Filter
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={activeTab === '3' ? 'active' : ''}
              onClick={() => {
                setActiveTab('3');
              }}
            >
              Join
            </NavLink>
          </NavItem>
        </Nav>
      )}
      {props.queryType === 'SELECT' && (
        <TabContent activeTab={activeTab} style={{ minHeight: '20vh' }}>
          <TabPane tabId="1">
            <Container fluid>
              <Row>
                <Col sm="12" className="p-1">
                  <QueryCreationTable />
                </Col>
              </Row>
            </Container>
          </TabPane>
          <TabPane tabId="3">
            <Container fluid>
              <Row>
                <Col sm="12" className="p-1">
                  <SetList />
                </Col>
              </Row>
            </Container>
          </TabPane>
        </TabContent>
      )}
      {props.queryType === 'DELETE' && (
        <TabContent activeTab={activeTab} style={{ minHeight: '20vh' }}>
          <TabPane tabId="1">
            <Container fluid>
              <Row>
                <Col sm="12" className="p-1">
                  <NewQueryColumnList />
                </Col>
              </Row>
            </Container>
          </TabPane>
          <TabPane tabId="2">
            <Container fluid>
              <Row>
                <Col sm="12" className="p-1">
                  <UsingList />
                </Col>
              </Row>
            </Container>
          </TabPane>
        </TabContent>
      )}
      {props.queryType === 'INSERT' && (
        <TabContent activeTab={activeTab} style={{ minHeight: '20vh' }}>
          <TabPane tabId="1">
            <Container fluid>
              <InsertQueryColumnList />
            </Container>
          </TabPane>
        </TabContent>
      )}
      {props.queryType === 'UPDATE' && (
        <TabContent activeTab={activeTab} style={{ minHeight: '20vh' }}>
          <TabPane tabId="1">
            <Container fluid>
              <UpdateQueryColumnList />
            </Container>
          </TabPane>
          <TabPane tabId="2">
            <Container fluid>
              <NewQueryColumnList />
            </Container>
          </TabPane>
          <TabPane tabId="3">
            <Container fluid>
              <Row>
                <Col sm="12" className="p-1">
                  <UsingList />
                </Col>
              </Row>
            </Container>
          </TabPane>
        </TabContent>
      )}
    </div>
  );
};

QueryTabs.propTypes = {
  language: PropTypes.shape({ code: PropTypes.string }),
};

const mapStateToProps = (store) => ({
  language: store.settings.language,
  queryType: store.query.queryType,
});

export default connect(mapStateToProps)(QueryTabs);

import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import LanguageSwitcher from '../components/LanguageSwitcher';
import InformationPopover from '../components/InformationPopover';
import DatabaseSelector from '../components/DatabaseSelector';
import LoginFormContainer from '../components/LoginFormContainer';
import { useAppSelector } from '../hooks';

const LandingPage: React.FC = () => {
  const { loggedIn } = useAppSelector((state) => ({
    loggedIn: state.host.loggedIn,
  }));

  return (
    <Container className="vh-100 pt-4">
      <Row>
        <Col>
          <LanguageSwitcher />
        </Col>
        <InformationPopover />
      </Row>
      <Row className="justify-content-center pt-4">
        <Col sm="9" md="7" lg="5" className="">
          {loggedIn ? <DatabaseSelector /> : <LoginFormContainer />}
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;

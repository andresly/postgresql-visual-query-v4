import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { fetchAvailableDatabases, logIn } from '../actions/databaseActions';
import { translations } from '../utils/translations';

const LoginForm = (props) => {
  const languageCode = props.language && props.language.code ? props.language.code : 'eng';
  return (
    <Container>
      <h3>{translations[languageCode].loginForm.formHeader}</h3>
      <Form onSubmit={props.handleSubmit}>
        <FormGroup>
          <Label htmlFor="userName">{translations[languageCode].loginForm.usernameL}</Label>
          <Input
            required
            type="text"
            className="form-control"
            id="userName"
            name="user"
            placeholder={translations[languageCode].loginForm.usernamePh}
            value={props.user}
            onChange={props.handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">{translations[languageCode].loginForm.passwordL}</Label>
          <Input
            required
            type="password"
            autoComplete="on"
            className="form-control"
            id="password"
            name="password"
            placeholder={translations[languageCode].loginForm.passwordPh}
            value={props.password}
            onChange={props.handleChange}
          />
        </FormGroup>
        <Button color="primary" type="submit" className="btn-block" disabled={props.connecting}>
          {props.connecting ? (
            <div className="d-flex align-items-center justify-content-center">
              <div className="mr-2">{translations[languageCode].loginForm.connecting}</div>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            </div>
          ) : (
            translations[languageCode].loginForm.formSubmit
          )}
        </Button>
      </Form>
    </Container>
  );
};

LoginForm.propTypes = {
  language: PropTypes.shape({ code: PropTypes.string }),
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
  user: PropTypes.string,
  password: PropTypes.string,
  connecting: PropTypes.bool,
};

const LoginFormContainer = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const { connected, error, language, connecting } = useSelector((state) => ({
    connected: state.host.connected,
    error: state.host.error,
    language: state.settings.language,
    connecting: state.host.connecting,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(logIn({ user, password }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'user') {
      setUser(value);
    } else {
      setPassword(value);
    }
  };

  return (
    <div>
      {error && <Alert color="danger">{error}</Alert>}
      <LoginForm
        language={language}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        user={user}
        password={password}
        connecting={connecting}
      />
    </div>
  );
};

export default LoginFormContainer;

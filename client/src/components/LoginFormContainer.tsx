import React, { useState } from 'react';
import { Alert, Button, Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { logIn } from '../actions/databaseActions';
import { translations } from '../utils/translations';
import { useAppSelector, useAppDispatch } from '../hooks';
import { LanguageType } from '../types/settingsType';

interface LoginFormProps {
  language: LanguageType;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: string;
  password: string;
  connecting: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ language, handleSubmit, handleChange, user, password, connecting }) => {
  const languageCode = language?.code || 'eng';

  return (
    <Container>
      <h3>{translations[languageCode].loginForm.formHeader}</h3>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="userName">{translations[languageCode].loginForm.usernameL}</Label>
          <Input
            required
            type="text"
            className="form-control"
            id="userName"
            name="user"
            placeholder={translations[languageCode].loginForm.usernamePh}
            value={user}
            onChange={handleChange}
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
            value={password}
            onChange={handleChange}
          />
        </FormGroup>
        <Button color="primary" type="submit" className="btn-block" disabled={connecting}>
          {connecting ? (
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

const LoginFormContainer: React.FC = () => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useAppDispatch();
  const { error, language, connecting } = useAppSelector((state) => ({
    error: state.host.error,
    language: state.settings.language,
    connecting: state.host.connecting,
  }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(logIn({ user, password }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

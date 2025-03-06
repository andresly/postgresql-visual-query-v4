import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Input } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { connectToDatabase, fetchAvailableDatabases } from '../actions/databaseActions';
import { logout, getDatabaseVersion } from '../actions/hostActions';
import { translations } from '../utils/translations';
import { useAppDispatch, useAppSelector } from '../hooks';

const DatabaseSelector = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const { availableDatabases, connected, user, password, language, psqlVersion } = useAppSelector((state) => ({
    availableDatabases: state.database.availableDatabases,
    connected: state.host.connected,
    user: state.host.user,
    password: state.host.password,
    language: state.settings.language,
    psqlVersion: state.host.psqlVersion,
  }));

  useEffect(() => {
    dispatch(fetchAvailableDatabases({ user, password }));
    dispatch(getDatabaseVersion({ user, password }));
  }, [dispatch, user, password]);

  const handleDatabaseClick = (database) => {
    const params = {
      user: user,
      password: password,
      database: database,
    };

    dispatch(connectToDatabase(params));
  };

  const filteredDatabases = Array.isArray(availableDatabases)
    ? availableDatabases.filter((db) => db.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (connected) {
    return <Redirect to="/query" replace />;
  }

  return (
    <div>
      <h1 className="mb-1">{translations[language.code].loginForm.availableDatabases}</h1>
      <div className="mb-4">{psqlVersion}</div>
      <Button className="w-100 btn-danger mb-4" onClick={() => dispatch(logout())}>
        {translations[language.code].loginForm.logout}
      </Button>
      <Input
        type="text"
        placeholder={translations[language.code].loginForm.searchDatabases}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
      />
      <div className="d-flex flex-column gap-3">
        {filteredDatabases.map((db, index) => (
          <Button key={index} onClick={() => handleDatabaseClick(db)} className="mb-2">
            {db}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DatabaseSelector;

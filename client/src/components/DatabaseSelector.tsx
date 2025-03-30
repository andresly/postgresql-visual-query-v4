import React, { useEffect, useState } from 'react';
import { Button, Input } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { connectToDatabase, fetchAvailableDatabases } from '../actions/databaseActions';
import { logout, getDatabaseVersion } from '../actions/hostActions';
import { translations } from '../utils/translations';
import { useAppDispatch, useAppSelector } from '../hooks';

const DatabaseSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const availableDatabases = useAppSelector((state) => state.database.availableDatabases);
  const { database } = useAppSelector((state) => state.host);
  const { user, password, psqlVersion, connected } = useAppSelector((state) => state.host);
  const language = useAppSelector((state) => state.settings.language);

  useEffect(() => {
    dispatch(fetchAvailableDatabases({ user, password, database: database }));
    dispatch(getDatabaseVersion({ user, password }));
  }, [dispatch, user, password]);

  const handleDatabaseClick = (database: string) => {
    const params = {
      user,
      password,
      database,
    };

    dispatch(connectToDatabase(params));
  };

  const filteredDatabases = Array.isArray(availableDatabases)
    ? availableDatabases.filter((db: string) => db.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  if (connected) {
    return <Redirect to="/query" />;
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
        {filteredDatabases.map((db: string, index: number) => (
          <Button key={index} onClick={() => handleDatabaseClick(db)} className="mb-2">
            {db}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DatabaseSelector;

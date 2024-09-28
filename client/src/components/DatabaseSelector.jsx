import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { connectToDatabase } from '../actions/databaseActions';
import fetchAvailableDatabases from '../actions/fetchAvailableDatabases';

const DatabaseSelector = () => {
  const dispatch = useDispatch();
  const { availableDatabases, connected } = useSelector((state) => ({
    availableDatabases: state.database.availableDatabases,
    connected: state.host.connected,
  }));

  useEffect(() => {
    dispatch(fetchAvailableDatabases());
  }, [dispatch]);

  const handleDatabaseClick = (database) => {
    const params = {
      host: process.env.REACT_APP_DATABASE_HOST,
      port: process.env.REACT_APP_DATABASE_PORT,
      user: process.env.REACT_APP_DATABASE_USERNAME,
      password: process.env.REACT_APP_DATABASE_PASSWORD,
      database: database,
    };

    dispatch(connectToDatabase(params));
  };

  if (connected) return <Redirect to="/query" replace />;

  return (
    <div>
      <h1 className="mb-4">Available Databases</h1>
      <div className="d-flex flex-column gap-3">
        {availableDatabases &&
          availableDatabases.map((db, index) => (
            <Button key={index} onClick={() => handleDatabaseClick(db)} style={{ marginBottom: '10px' }}>
              {db}
            </Button>
          ))}
      </div>
    </div>
  );
};

export default DatabaseSelector;

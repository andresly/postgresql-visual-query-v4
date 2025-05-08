import React from 'react';
import { Button } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import { disconnect } from '../actions/hostActions';
import { translations } from '../utils/translations';
import { useAppDispatch, useAppSelector } from '../hooks';

export const DisconnectButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const connected = useAppSelector((state) => state.host.connected);
  const language = useAppSelector((state) => state.settings.language);

  const handleOnClick = () => {
    dispatch(disconnect());
  };

  if (!connected) {
    return <Redirect to="/" />;
  }

  return (
    <Button size="lg" className="btn-block my-2 px-2 switch-db" color="black" onClick={handleOnClick}>
      {translations[language.code].sideBar.disconnectB}
    </Button>
  );
};

export default DisconnectButton;

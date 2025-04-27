import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from '../hooks';
import { translations } from '../utils/translations';
import { LanguageType } from '../types/settingsType';
import { QueryType } from '../types/queryTypes';
import { copyQuery } from '../actions/queriesActions';
import { regenerateSql, setActiveQuery } from '../actions/queryActions';
import _ from 'lodash';
import store from '../store';
import { setActiveTableView } from '../actions/tableViewActions';

interface CopyQueryButtonProps {
  className?: string;
}

export const CopyQueryButton: React.FC<CopyQueryButtonProps> = ({ className }) => {
  const dispatch = useAppDispatch();
  const activeQuery = useAppSelector((state) => state.query) as QueryType;
  const hostInfo = useAppSelector((state) => state.host);
  const language = useAppSelector((state) => state.settings.language) as LanguageType;

  const handleCopyQuery = () => {
    // Check if there's anything to copy
    if (!activeQuery.tables.length && !activeQuery.columns.length) {
      alert(translations[language.code].copyQuery.emptyQueryMessage);
      return;
    }

    // Store original active query
    const originalActiveQuery = _.cloneDeep(activeQuery);

    // Save the original flow state from sessionStorage before creating the new query
    const originalFlowState = sessionStorage.getItem(`flow-state-${originalActiveQuery.id}`);

    // Create a new copy of the active query
    dispatch(copyQuery(originalActiveQuery));

    // Get updated state to find the new query
    const currentState = store.getState();
    const sortedQueries = [...currentState.queries].sort((a, b) => b.id - a.id);
    const newQuery = sortedQueries[0]; // This is the copied query

    // Copy the flow state for the new query ID
    if (originalFlowState) {
      sessionStorage.setItem(`flow-state-${newQuery.id}`, originalFlowState);
    }

    // Set active view to null and switch to the new query
    // dispatch(setActiveTableView(null));
    // dispatch(setActiveQuery(newQuery));
    // dispatch(regenerateSql());
  };

  return (
    <Button
      color="info"
      size="sm"
      className={`query-button mr-2 ${className || ''}`}
      onClick={handleCopyQuery}
      title={translations[language.code].copyQuery.buttonTitle}
      disabled={!hostInfo.connected || !hostInfo.database}
    >
      <FontAwesomeIcon icon="copy" className="mr-1" />
      {translations[language.code].copyQuery.buttonText}
    </Button>
  );
};

export default CopyQueryButton;

import React from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translations } from '../utils/translations';
import { QueryType } from '../types/queryTypes';
import { LanguageType } from '../types/settingsType';
import { useAppSelector } from '../hooks';
import { Node, Viewport } from '@xyflow/react';

interface SaveQueryButtonProps {
  className?: string;
}

interface SavedFlowState {
  nodes: Node[];
  viewport: Viewport;
}

interface DatabaseInfo {
  database: string;
  user: string;
}

interface SavedQueryData {
  activeQuery: QueryType;
  allQueries: QueryType[];
  flowState: SavedFlowState | null;
  databaseInfo: DatabaseInfo;
}

export const SaveQueryButton: React.FC<SaveQueryButtonProps> = ({ className }) => {
  const language = useAppSelector((state) => state.settings.language) as LanguageType;
  const activeQuery = useAppSelector((state) => state.query) as QueryType;
  const allQueries = useAppSelector((state) => state.queries) as QueryType[];
  const hostInfo = useAppSelector((state) => state.host);

  const saveQuery = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const queryName = activeQuery.queryName || translations[language.code].saveQuery.unnamedQuery;
    const queryType = activeQuery.queryType || 'SELECT';
    const saveKey = `${queryName}-${timestamp}`;

    // Check if connected to a database
    if (!hostInfo.connected || !hostInfo.database) {
      alert(translations[language.code].saveQuery.notConnected);
      return;
    }

    // Try to get the flow state from sessionStorage
    let flowState: SavedFlowState | null = null;
    try {
      const savedFlowStateStr = sessionStorage.getItem(`flow-state-${activeQuery.id}`);
      if (savedFlowStateStr) {
        flowState = JSON.parse(savedFlowStateStr);
      }
    } catch (err) {
      console.warn('Unable to parse flow state:', err);
    }

    // Save database info for this query
    const databaseInfo: DatabaseInfo = {
      database: hostInfo.database,
      user: hostInfo.user,
    };

    // Create the data object with active query, all queries, and flow state
    const queryDataToSave: SavedQueryData = {
      activeQuery,
      allQueries,
      flowState,
      databaseInfo,
    };

    // Get existing saved queries or create new array
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');

    // Add new query to saved queries
    const queryToSave = {
      key: saveKey,
      name: queryName,
      type: queryType,
      timestamp: new Date().toISOString(),
      activeQueryId: activeQuery.id,
      hasFlowState: flowState !== null,
      database: hostInfo.database,
    };

    savedQueries.push(queryToSave);

    // Save to localStorage
    localStorage.setItem('savedQueries', JSON.stringify(savedQueries));
    localStorage.setItem(`query-${saveKey}`, JSON.stringify(queryDataToSave));

    // Format success message with parameters
    const successMessage = translations[language.code].saveQuery.successMessage
      .replace('{0}', queryName)
      .replace('{1}', hostInfo.database);

    alert(successMessage);
  };

  return (
    <Button
      color="info"
      size="sm"
      className={`query-button mr-2 ${className || ''}`}
      onClick={saveQuery}
      title={translations[language.code].saveQuery.buttonTitle}
      disabled={!hostInfo.connected || !hostInfo.database}
    >
      <FontAwesomeIcon icon="save" className="mr-1" />
      {translations[language.code].saveQuery.buttonText}
    </Button>
  );
};

export default SaveQueryButton;

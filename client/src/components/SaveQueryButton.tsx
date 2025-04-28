import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Alert } from 'reactstrap';
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
  allQueryFlowStates: Record<number, SavedFlowState>;
  databaseInfo: DatabaseInfo;
}

export const SaveQueryButton: React.FC<SaveQueryButtonProps> = ({ className }) => {
  const language = useAppSelector((state) => state.settings.language) as LanguageType;
  const activeQuery = useAppSelector((state) => state.query) as QueryType;
  const allQueries = useAppSelector((state) => state.queries) as QueryType[];
  const hostInfo = useAppSelector((state) => state.host);

  // State for modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [existingKey, setExistingKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Toggle save modal
  const toggleSaveModal = () => {
    if (!saveModalOpen) {
      // Generate default name when opening
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      const defaultName = `query-${dateStr}-${timeStr}`;

      setQueryName(defaultName);
      setError(null);
    }
    setSaveModalOpen(!saveModalOpen);
  };

  // Toggle confirm modal
  const toggleConfirmModal = () => {
    setConfirmModalOpen(!confirmModalOpen);
  };

  // Handle query name change
  const handleQueryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryName(e.target.value);
  };

  // Check if a query with this name already exists
  const checkForExistingQuery = (name: string): boolean => {
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
    const existing = savedQueries.find((q: any) => q.name === name);

    if (existing) {
      setExistingKey(existing.key);
      return true;
    }

    return false;
  };

  // Custom translation accessor function to handle missing keys
  const getText = (key: string, defaultValue: string): string => {
    const saveQuery = translations[language.code].saveQuery as any;
    return saveQuery && saveQuery[key] ? saveQuery[key] : defaultValue;
  };

  // Handle save button click in the first modal
  const handleSaveClick = () => {
    // Validate name
    if (!queryName.trim()) {
      setError(getText('nameRequired', 'Query name is required'));
      return;
    }

    // Check if a query with this name already exists
    if (checkForExistingQuery(queryName)) {
      // If exists, show confirmation modal
      toggleConfirmModal();
    } else {
      // If doesn't exist, save directly
      saveQueryToStorage(queryName);
      toggleSaveModal();
    }
  };

  // Handle confirm overwrite
  const handleConfirmOverwrite = () => {
    saveQueryToStorage(queryName, existingKey);
    toggleConfirmModal();
    toggleSaveModal();
  };

  const saveQueryToStorage = (name: string, existingKey = '') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const queryType = activeQuery.queryType || 'SELECT';
    const saveKey = existingKey || `${name}-${timestamp}`;

    // Check if connected to a database
    if (!hostInfo.connected || !hostInfo.database) {
      alert(getText('notConnected', 'Not connected to a database'));
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

    // Also collect flow states for all other queries
    const allQueryFlowStates: Record<number, SavedFlowState> = {};

    // Check each query for a flow state
    allQueries.forEach((query) => {
      try {
        const queryFlowStateStr = sessionStorage.getItem(`flow-state-${query.id}`);
        if (queryFlowStateStr) {
          const queryFlowState = JSON.parse(queryFlowStateStr);
          if (queryFlowState && queryFlowState.nodes && queryFlowState.viewport) {
            allQueryFlowStates[query.id] = queryFlowState;
            console.log(`Found and saving flow state for query ${query.id}`);
          }
        } else {
          console.log(`No flow state found for query ${query.id}`);
        }
      } catch (err) {
        console.warn(`Unable to parse flow state for query ${query.id}:`, err);
      }
    });

    console.log('All queries flow states:', Object.keys(allQueryFlowStates));

    // Save database info for this query
    const databaseInfo: DatabaseInfo = {
      database: hostInfo.database,
      user: hostInfo.user,
    };

    // Create a copy of the active query with the updated name
    const namedActiveQuery = {
      ...activeQuery,
      queryName: name,
    };

    // Create the data object with active query, all queries, and flow state
    const queryDataToSave: SavedQueryData = {
      activeQuery: namedActiveQuery,
      allQueries,
      flowState,
      allQueryFlowStates,
      databaseInfo,
    };

    // Get existing saved queries or create new array
    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');

    // If we're overwriting, remove the existing query
    const updatedQueries = existingKey ? savedQueries.filter((q: any) => q.key !== existingKey) : savedQueries;

    // Add new query to saved queries
    const queryToSave = {
      key: saveKey,
      name: name,
      type: queryType,
      timestamp: new Date().toISOString(),
      activeQueryId: activeQuery.id,
      hasFlowState: flowState !== null,
      database: hostInfo.database,
    };

    updatedQueries.push(queryToSave);

    // Save to localStorage
    localStorage.setItem('savedQueries', JSON.stringify(updatedQueries));
    localStorage.setItem(`query-${saveKey}`, JSON.stringify(queryDataToSave));

    // No more alert, just success
    // Format success message with parameters
    //const successMessage = getText('successMessage', 'Query saved successfully')
    //  .replace('{0}', name)
    //  .replace('{1}', hostInfo.database);
    //
    //alert(successMessage);
  };

  return (
    <>
      <Button
        color="info"
        size="sm"
        className={`query-button mr-2 ${className || ''}`}
        onClick={toggleSaveModal}
        title={getText('buttonTitle', 'Save Query')}
        disabled={!hostInfo.connected || !hostInfo.database}
      >
        <FontAwesomeIcon icon="save" className="mr-1" />
        {getText('buttonText', 'Save Query')}
      </Button>

      {/* Save Modal */}
      <Modal isOpen={saveModalOpen} toggle={toggleSaveModal}>
        <ModalHeader toggle={toggleSaveModal}>{getText('modalTitle', 'Save Query')}</ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}
          <FormGroup>
            <Label for="queryName">{getText('queryNameLabel', 'Query Name')}</Label>
            <Input
              type="text"
              id="queryName"
              placeholder={getText('queryNamePlaceholder', 'Enter query name')}
              value={queryName}
              onChange={handleQueryNameChange}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleSaveModal}>
            {getText('cancelButton', 'Cancel')}
          </Button>
          <Button color="primary" onClick={handleSaveClick}>
            {getText('saveButton', 'Save')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Overwrite Confirmation Modal */}
      <Modal isOpen={confirmModalOpen} toggle={toggleConfirmModal}>
        <ModalHeader toggle={toggleConfirmModal}>{getText('confirmOverwriteTitle', 'Confirm Overwrite')}</ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <strong>{getText('warningHeader', 'Warning!')}</strong>{' '}
            {getText(
              'confirmOverwriteMessage',
              'A query with the name "{0}" already exists. Do you want to overwrite it?',
            ).replace('{0}', queryName)}
          </Alert>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleConfirmModal}>
            {getText('cancelButton', 'Cancel')}
          </Button>
          <Button color="danger" onClick={handleConfirmOverwrite}>
            {getText('overwriteButton', 'Overwrite')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SaveQueryButton;

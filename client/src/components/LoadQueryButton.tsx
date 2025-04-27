import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table, Alert, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { translations } from '../utils/translations';
import { QueryType } from '../types/queryTypes';
import { LanguageType } from '../types/settingsType';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setActiveQuery } from '../actions/queryActions';
import { Node, Viewport } from '@xyflow/react';
import { updateQueries } from '../actions/queriesActions';

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

interface SavedQueryMetadata {
  key: string;
  name: string;
  type: string;
  timestamp: string;
  activeQueryId: number;
  hasFlowState: boolean;
  database: string;
}

interface LoadQueryButtonProps {
  className?: string;
}

export const LoadQueryButton: React.FC<LoadQueryButtonProps> = ({ className }) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [selectedQuery, setSelectedQuery] = useState<{ key: string; name: string } | null>(null);
  const [savedQueries, setSavedQueries] = useState<SavedQueryMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAllDatabases, setShowAllDatabases] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.settings.language) as LanguageType;
  const hostInfo = useAppSelector((state) => state.host);

  // Load saved queries when modal is opened
  useEffect(() => {
    if (modalOpen) {
      loadSavedQueries();
    }
  }, [modalOpen, showAllDatabases]);

  const loadSavedQueries = () => {
    try {
      const queries = JSON.parse(localStorage.getItem('savedQueries') || '[]');

      // Filter queries by current database if not showing all
      const filteredQueries = showAllDatabases
        ? queries
        : queries.filter((q: SavedQueryMetadata) => q.database === hostInfo.database);

      setSavedQueries(
        filteredQueries.sort(
          (a: SavedQueryMetadata, b: SavedQueryMetadata) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        ),
      );
      setError(null);
    } catch (err) {
      setError('Failed to load saved queries');
      setSavedQueries([]);
    }
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const toggleConfirmModal = () => {
    setConfirmModalOpen(!confirmModalOpen);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (err) {
      return dateString;
    }
  };

  const confirmLoadQuery = (key: string, name: string) => {
    setSelectedQuery({ key, name });
    setConfirmModalOpen(true);
  };

  const handleLoadQuery = () => {
    if (!selectedQuery) return;

    try {
      const queryData = localStorage.getItem(`query-${selectedQuery.key}`);
      if (queryData) {
        const parsedData = JSON.parse(queryData) as SavedQueryData;
        const { activeQuery, allQueries, flowState, databaseInfo } = parsedData;

        // Check if the saved query is from the current database
        if (databaseInfo.database !== hostInfo.database) {
          setError(
            `Warning: This query was saved for database "${databaseInfo.database}" but you are currently connected to "${hostInfo.database}". Loading may cause errors.`,
          );
          return;
        }

        // Load the active query
        dispatch(setActiveQuery(activeQuery));

        // Update all other queries
        allQueries.forEach((query) => {
          if (query.id !== activeQuery.id) {
            dispatch(updateQueries(query, activeQuery.id));
          }
        });

        // Save flow state to sessionStorage if available
        if (flowState) {
          try {
            sessionStorage.setItem(`flow-state-${activeQuery.id}`, JSON.stringify(flowState));
          } catch (err) {
            console.warn('Unable to save flow state to sessionStorage:', err);
          }
        }

        setConfirmModalOpen(false);
        toggleModal();
      } else {
        setError('Query data not found');
      }
    } catch (err) {
      setError('Failed to load query');
    }
  };

  const handleDeleteQuery = (key: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the query "${name}"?`)) {
      try {
        // Remove from saved queries list
        const updatedQueries = savedQueries.filter((q) => q.key !== key);

        // Update the full saved queries list
        const allSavedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]');
        const updatedAllQueries = allSavedQueries.filter((q: SavedQueryMetadata) => q.key !== key);
        localStorage.setItem('savedQueries', JSON.stringify(updatedAllQueries));

        // Remove the individual query data
        localStorage.removeItem(`query-${key}`);

        // Update the state
        setSavedQueries(updatedQueries);
      } catch (err) {
        setError('Failed to delete query');
      }
    }
  };

  const toggleShowAllDatabases = () => {
    setShowAllDatabases(!showAllDatabases);
  };

  return (
    <>
      <Button
        color="primary"
        size="sm"
        className={`mr-2 ${className || ''}`}
        onClick={toggleModal}
        title="Load Query"
        disabled={!hostInfo.connected || !hostInfo.database}
      >
        <FontAwesomeIcon icon="folder-open" className="mr-1" />
        Load Query
      </Button>

      {/* Main Modal with Saved Queries List */}
      <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
        <ModalHeader toggle={toggleModal}>Saved Queries</ModalHeader>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}

          <FormGroup check className="mb-3">
            <Label check>
              <Input type="checkbox" checked={showAllDatabases} onChange={toggleShowAllDatabases} /> Show queries from
              all databases (current database: {hostInfo.database})
            </Label>
          </FormGroup>

          {savedQueries.length === 0 ? (
            <Alert color="info">
              {showAllDatabases
                ? 'No saved queries found in any database'
                : `No saved queries found for database "${hostInfo.database}"`}
            </Alert>
          ) : (
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Database</th>
                  <th>Date Saved</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedQueries.map((query) => (
                  <tr key={query.key} className={query.database !== hostInfo.database ? 'bg-light text-muted' : ''}>
                    <td>{query.name}</td>
                    <td>{query.type}</td>
                    <td>
                      {query.database === hostInfo.database ? (
                        <span className="text-success">{query.database}</span>
                      ) : (
                        <span className="text-danger">{query.database}</span>
                      )}
                    </td>
                    <td>{formatDate(query.timestamp)}</td>

                    <td>
                      <Button
                        color="success"
                        size="sm"
                        className="mr-2"
                        onClick={() => confirmLoadQuery(query.key, query.name)}
                        disabled={query.database !== hostInfo.database}
                      >
                        <FontAwesomeIcon icon="file-import" className="mr-1" />
                        Load
                      </Button>
                      <Button color="danger" size="sm" onClick={() => handleDeleteQuery(query.key, query.name)}>
                        <FontAwesomeIcon icon="trash-alt" className="mr-1" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </ModalBody>
      </Modal>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModalOpen} toggle={toggleConfirmModal}>
        <ModalHeader toggle={toggleConfirmModal}>Confirm Loading Query</ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <strong>Warning!</strong> Loading query &quot;{selectedQuery?.name}&quot; will overwrite your current query
            and all other stored queries. All unsaved changes will be lost.
          </Alert>
          <p>Are you sure you want to continue?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleConfirmModal}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleLoadQuery}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default LoadQueryButton;

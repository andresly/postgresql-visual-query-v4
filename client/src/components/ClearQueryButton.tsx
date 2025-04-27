import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from '../hooks';
import { resetQuery } from '../actions/queryActions';
import { QueryType } from '../types/queryTypes';

interface ClearQueryButtonProps {
  className?: string;
}

export const ClearQueryButton: React.FC<ClearQueryButtonProps> = ({ className }) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const activeQuery = useAppSelector((state) => state.query) as QueryType;
  const hostInfo = useAppSelector((state) => state.host);

  const toggleConfirmModal = () => {
    setConfirmModalOpen(!confirmModalOpen);
  };

  const handleClearQuery = () => {
    // Check if there's anything to clear
    if (!activeQuery.tables.length && !activeQuery.joins.length) {
      alert('The query is already empty.');
      setConfirmModalOpen(false);
      return;
    }

    // Reset the query, maintaining its ID and type
    dispatch(resetQuery(activeQuery.queryType));

    // Also clear any flow state from sessionStorage
    try {
      sessionStorage.removeItem(`flow-state-${activeQuery.id}`);
    } catch (err) {
      console.warn('Failed to clear flow state from sessionStorage', err);
    }

    setConfirmModalOpen(false);
  };

  return (
    <>
      <Button
        color="secondary"
        size="sm"
        className={`mr-2 ${className || ''}`}
        onClick={toggleConfirmModal}
        title="Clear Query"
        disabled={!hostInfo.connected || !hostInfo.database}
      >
        <FontAwesomeIcon icon="eraser" className="mr-1" />
        Clear Query
      </Button>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModalOpen} toggle={toggleConfirmModal}>
        <ModalHeader toggle={toggleConfirmModal}>Clear Current Query</ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <strong>Warning!</strong> This will clear all tables, joins, and settings from your current query. All
            unsaved changes will be lost.
          </Alert>
          <p>Are you sure you want to start with a new empty query?</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleConfirmModal}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleClearQuery}>
            Clear Query
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ClearQueryButton;

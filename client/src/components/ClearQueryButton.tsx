import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppDispatch, useAppSelector } from '../hooks';
import { resetQuery } from '../actions/queryActions';
import { QueryType } from '../types/queryTypes';
import { translations } from '../utils/translations';
import { LanguageType } from '../types/settingsType';

interface ClearQueryButtonProps {
  className?: string;
}

export const ClearQueryButton: React.FC<ClearQueryButtonProps> = ({ className }) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const activeQuery = useAppSelector((state) => state.query) as QueryType;
  const hostInfo = useAppSelector((state) => state.host);
  const language = useAppSelector((state) => state.settings.language) as LanguageType;

  const toggleConfirmModal = () => {
    setConfirmModalOpen(!confirmModalOpen);
  };

  const handleClearQuery = () => {
    // Check if there's anything to clear
    if (!activeQuery.tables.length && !activeQuery.joins.length) {
      alert(translations[language.code].clearQuery.alreadyEmptyMessage);
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
        className={`query-button mr-2 ${className || ''}`}
        onClick={toggleConfirmModal}
        title={translations[language.code].clearQuery.buttonTitle}
        disabled={!hostInfo.connected || !hostInfo.database}
      >
        <FontAwesomeIcon icon="eraser" className="mr-1" />
        {translations[language.code].clearQuery.buttonText}
      </Button>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModalOpen} toggle={toggleConfirmModal}>
        <ModalHeader toggle={toggleConfirmModal}>{translations[language.code].clearQuery.modalTitle}</ModalHeader>
        <ModalBody>
          <Alert color="warning">
            <strong>{translations[language.code].clearQuery.warningHeader}</strong>{' '}
            {translations[language.code].clearQuery.confirmMessage}
          </Alert>
          <p>{translations[language.code].clearQuery.confirmPrompt}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleConfirmModal}>
            {translations[language.code].clearQuery.cancelButton}
          </Button>
          <Button color="danger" onClick={handleClearQuery}>
            {translations[language.code].clearQuery.clearButton}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ClearQueryButton;

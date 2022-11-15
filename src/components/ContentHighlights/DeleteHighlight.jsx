import React, { useState } from 'react';
import {
  Button,
  AlertModal,
  useToggle,
  ActionRow,
  StatefulButton,
} from '@edx/paragon';
import { useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';

export default function DeleteHighlight() {
  const { highlightSetUUID } = useParams();
  const [isOpen, open, close] = useToggle(false);
  const [deletionState, setDeletionState] = useState('default');

  const handleDeleteClick = () => {
    const deleteHighlightSet = async () => {
      setDeletionState('pending');
      try {
        await EnterpriseCatalogApiService.deleteHighlightSet(highlightSetUUID);
      } catch (error) {
        logError(error);
      } finally {
        setDeletionState('default');
      }
    };
    deleteHighlightSet();
  };

  return (
    <>
      <Button variant="outline-primary" onClick={open}>Delete highlight</Button>
      <AlertModal
        title="Delete highlight?"
        isOpen={isOpen}
        onClose={close}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={close}>Cancel</Button>
            <StatefulButton
              labels={{
                default: 'Delete highlight',
                pending: 'Deleting highlight...',
              }}
              variant="primary"
              state={deletionState}
              onClick={handleDeleteClick}
            />
          </ActionRow>
        )}
      >
        <p>
          Deleting highlight collection will remove it from your
          learners&apos; “Find a course” page. This action is permanent and cannot be undone.
        </p>
      </AlertModal>
    </>
  );
}

import React, { useState } from 'react';
import {
  Button, Hyperlink, ModalDialog, StatefulButton, Toast, useToggle,
} from '@edx/paragon';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import { configuration } from '../../config';
import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';

const DeleteArchivedCoursesDialogs = ({
  isDeleteModalOpen, closeDeleteModal, archivedContentKeys,
}) => {
  const { highlightSetUUID } = useParams();
  const [isErrorOpen, openError, closeError] = useToggle(false);
  const [toastShow, setToastShow] = useState(false);
  const [deletionState, setDeletionState] = useState('default');

  const handleDeleteArchivedClick = async () => {
    setDeletionState('pending');
    try {
      const resp = await EnterpriseCatalogApiService.deleteHighlightSetContent(highlightSetUUID, archivedContentKeys);
      if (resp.status === 201) {
        closeDeleteModal();
        setToastShow(true);
      }
    } catch (err) {
      closeDeleteModal();
      openError();
    } finally {
      setDeletionState('default');
    }
  };

  return (
    <>
      <ModalDialog
        isOpen={isErrorOpen}
        onClose={closeError}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>Something went wrong</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>
            Something went wrong behind the scenes when attempting to delete your archived courses.
            Please try again later or contact support.
          </p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button onClick={closeError} className="mr-2" variant="outline-primary">Dismiss</Button>
          <Hyperlink
            className="btn btn-primary"
            target="_blank"
            destination={configuration.ENTERPRISE_SUPPORT_URL}
          >
            Contact support
          </Hyperlink>
        </ModalDialog.Footer>
      </ModalDialog>
      <Toast
        onClose={() => setToastShow(false)}
        show={toastShow}
      >
        Archived courses deleted.
      </Toast>
      <ModalDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        isFullscreenOnMobile
      >
        <ModalDialog.Header>
          <ModalDialog.Title>Delete archived courses?</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>
            Deleting the archived courses in this highlight will remove it from your learners’
            “Find a Course”. This action is permanent and cannot be undone.
          </p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button onClick={closeDeleteModal} className="mr-2" variant="outline-primary">Cancel</Button>
          <StatefulButton
            labels={{
              default: 'Delete archived courses',
              pending: 'Deleting courses...',
            }}
            variant="primary"
            state={deletionState}
            onClick={handleDeleteArchivedClick}
            data-testid="delete-archived-button"
          />
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

DeleteArchivedCoursesDialogs.propTypes = {
  isDeleteModalOpen: PropTypes.bool.isRequired,
  closeDeleteModal: PropTypes.func.isRequired,
  archivedContentKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default DeleteArchivedCoursesDialogs;

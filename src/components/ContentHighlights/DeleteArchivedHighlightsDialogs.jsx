import React, { useContext, useState } from 'react';
import {
  Button, Hyperlink, ModalDialog, StatefulButton, useToggle,
} from '@openedx/paragon';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { configuration } from '../../config';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions } from '../EnterpriseApp/data/enterpriseCurationReducer';
import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';

const DeleteArchivedCoursesDialogs = ({
  isDeleteModalOpen, closeDeleteModal, archivedContentKeys, activeContentUuids, updateSetWithActiveContent,
}) => {
  const { highlightSetUUID } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isErrorOpen, openError, closeError] = useToggle(false);
  const [deletionState, setDeletionState] = useState('default');
  const {
    enterpriseCuration: { dispatch },
  } = useContext(EnterpriseAppContext);
  const intl = useIntl();

  const handleDeleteArchivedClick = async () => {
    setDeletionState('pending');
    try {
      const resp = await EnterpriseCatalogApiService.deleteHighlightSetContent(highlightSetUUID, archivedContentKeys);
      if (resp.status === 201) {
        closeDeleteModal();
        const payload = {
          activeContentUuids,
          highlightSetUUID,
        };
        dispatch(enterpriseCurationActions.updateHighlightSetContentItems(payload));
        dispatch(enterpriseCurationActions.setHighlightSetToast(highlightSetUUID));
        updateSetWithActiveContent();
        navigate(location.pathname, {
          state: { archiveCourses: true },
        });
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
        title="Archive error modal"
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
      <ModalDialog
        title="Delete archived courses"
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        isFullscreenOnMobile
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            <FormattedMessage
              id="highlights.highlights.tab.archived.courses.modal.heading"
              defaultMessage="Delete archived courses?"
              description="Heading for the modal to delete archived courses."
            />
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <p>
            <FormattedMessage
              id="highlights.highlights.tab.archived.courses.modal.message"
              defaultMessage="Deleting the archived courses in this highlight will remove it from your learners' {doubleQuote}Find a Course{doubleQuote}. This action is permanent and cannot be undone."
              description="Message shown in the modal to delete archived courses."
              values={{
                doubleQuote: '"',
              }}
            />
          </p>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button onClick={closeDeleteModal} className="mr-2" variant="outline-primary">
            <FormattedMessage
              id="highlights.highlights.tab.archived.courses.delete.modal.cancel.button.text"
              defaultMessage="Cancel"
              description="Button text shown on a modal to cancel the deletion of archived courses."
            />
          </Button>
          <StatefulButton
            labels={{
              default: intl.formatMessage({
                id: 'highlights.highlights.tab.archived.courses.delete.modal.delete.confirm.button.text',
                defaultMessage: 'Delete archived courses',
                description: 'Button text shown on a modal to confirm the deletion of archived courses.',
              }),
              pending: intl.formatMessage({
                id: 'highlights.highlights.tab.archived.courses.delete.modal.delete.in.progress.button.text',
                defaultMessage: 'Deleting courses...',
                description: 'Button text shown on a modal when the archived courses deletion is in progress.',
              }),
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
  activeContentUuids: PropTypes.arrayOf(PropTypes.string).isRequired,
  updateSetWithActiveContent: PropTypes.func.isRequired,
};

export default DeleteArchivedCoursesDialogs;

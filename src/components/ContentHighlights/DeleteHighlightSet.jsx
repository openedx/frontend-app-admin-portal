import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  AlertModal,
  useToggle,
  ActionRow,
  StatefulButton,
} from '@edx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Info } from '@edx/paragon/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { connect } from 'react-redux';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions } from '../EnterpriseApp/data/enterpriseCurationReducer';
import EVENT_NAMES from '../../eventTracking';

const DeleteHighlightSet = ({ enterpriseId, enterpriseSlug }) => {
  const { highlightSetUUID } = useParams();
  const [isOpen, open, close] = useToggle(false);
  const [deletionState, setDeletionState] = useState('default');
  const navigate = useNavigate();
  const { enterpriseCuration: { dispatch } } = useContext(EnterpriseAppContext);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletionError, setDeletionError] = useState(null);
  const intl = useIntl();

  const trackEventOpenDelete = () => {
    const trackInfo = {
      is_confirm_delete_highlight_set_modal_open: true,
      highlight_set_uuid: highlightSetUUID,
      is_highlight_deleted: false,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.DELETE_HIGHLIGHT_MODAL}.opened`,
      trackInfo,
    );
  };
  const trackEventCloseDelete = () => {
    const trackInfo = {
      is_confirm_delete_highlight_set_modal_open: false,
      highlight_set_uuid: highlightSetUUID,
      is_highlight_deleted: false,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.DELETE_HIGHLIGHT_MODAL}.closed`,
      trackInfo,
    );
  };
  const trackEventConfirmDelete = () => {
    const trackInfo = {
      is_confirm_delete_highlight_set_modal_open: true,
      highlight_set_uuid: highlightSetUUID,
      is_highlight_deleted: true,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.DELETE_HIGHLIGHT_MODAL}.confirmed`,
      trackInfo,
    );
  };
  const openDeleteConfirmation = () => {
    open();
    trackEventOpenDelete();
  };
  const closeDeleteConfirmation = () => {
    close();
    trackEventCloseDelete();
  };
  const handleDeleteClick = () => {
    const deleteHighlightSet = async () => {
      setDeletionState('pending');
      try {
        dispatch(enterpriseCurationActions.setHighlightSetToast(highlightSetUUID));
        await EnterpriseCatalogApiService.deleteHighlightSet(highlightSetUUID);
        dispatch(enterpriseCurationActions.deleteHighlightSet(highlightSetUUID));
        setIsDeleted(true);
        trackEventConfirmDelete();
      } catch (error) {
        logError(error);
        setDeletionError(error);
      } finally {
        setDeletionState('default');
      }
    };
    deleteHighlightSet();
  };
  useEffect(() => {
    if (isDeleted) {
      close();
      navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}`, {
        state: { deletedHighlightSet: true },
      });
    }
  }, [isDeleted, close, highlightSetUUID, enterpriseSlug, navigate]);

  return (
    <>
      <Button variant="outline-primary" onClick={openDeleteConfirmation}>
        <FormattedMessage
          id="highlights.delete.highlight.button.text"
          defaultMessage="Delete highlight"
          description="Button text to delete a highlight set."
        />
      </Button>
      <AlertModal
        title={intl.formatMessage({
          id: 'highlights.modal.delete.highlight.confirm.title',
          defaultMessage: 'Delete highlight?',
          description: 'Title of the modal to confirm the deletion of a highlight.',
        })}
        isOpen={isOpen}
        onClose={close}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={closeDeleteConfirmation}>
              <FormattedMessage
                id="highlights.modal.delete.highlight.cancel.button.text"
                defaultMessage="Cancel"
                description="Button text shown on a modal to cancel the deletion of a highlight."
              />
            </Button>
            <StatefulButton
              labels={{
                default: intl.formatMessage({
                  id: 'highlights.modal.delete.highlight.confirm.button.text',
                  defaultMessage: 'Delete highlight',
                  description: 'Button text shown on a modal to confirm the deletion of a highlight.',
                }),
                pending: intl.formatMessage({
                  id: 'highlights.modal.delete.highlight.delete.in.progress.button.text',
                  defaultMessage: 'Deleting highlight...',
                  description: 'Button text shown on a modal when the highlight deletion is in progress.',
                }),
              }}
              variant="primary"
              state={deletionState}
              onClick={handleDeleteClick}
              data-testid="delete-confirmation-button"
            />
          </ActionRow>
        )}
      >
        <Alert
          show={!!deletionError}
          onClose={() => setDeletionError(null)}
          variant="danger"
          dismissible
          closeLabel={intl.formatMessage({
            id: 'highlights.modal.delete.highlight.error.dismiss.button.text',
            defaultMessage: 'Dismiss',
            description: 'Dismiss button label for error alert shown when deleting a highlight fails.',
          })}
          icon={Info}
        >
          <p>
            <FormattedMessage
              id="highlights.modal.delete.highlight.error.message"
              defaultMessage="An error occurred while deleting this highlight collection. Please try again."
              description="Error message shown when deleting a highlight fails."
            />
          </p>
        </Alert>
        <p>
          <FormattedMessage
            id="highlights.modal.delete.highlight.confirmation.message"
            defaultMessage="Deleting this highlight will remove it from your learners{apostrophe} {doubleQoute}Find a Course{doubleQoute}. This action is permanent and cannot be undone."
            description="Confirmation message shown when deleting a highlight."
            values={{
              apostrophe: "'",
              doubleQoute: '"',
            }}
          />
        </p>
      </AlertModal>
    </>
  );
};

DeleteHighlightSet.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(DeleteHighlightSet);

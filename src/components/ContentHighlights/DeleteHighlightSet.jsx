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
import { Info } from '@edx/paragon/icons';
import { useParams, useHistory } from 'react-router-dom';
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
  const history = useHistory();
  const { enterpriseCuration: { dispatch } } = useContext(EnterpriseAppContext);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletionError, setDeletionError] = useState(null);

  const trackEventOpenDelete = () => {
    open();
    const trackInfo = {
      is_confirm_delete_highlight_set_modal_open: true,
      highlight_set_uuid: highlightSetUUID,
      is_highlight_deleted: false,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.DELETE_HIGHLIGHT_BUTTON}.clicked`,
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
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.DELETE_HIGHLIGHT_CONFIRM}.clicked`,
      trackInfo,
    );
  };
  const trackEventCloseDelete = () => {
    close();
    const trackInfo = {
      is_confirm_delete_highlight_set_modal_open: false,
      highlight_set_uuid: highlightSetUUID,
      is_highlight_deleted: false,
    };
    sendEnterpriseTrackEvent(
      enterpriseId,
      `${EVENT_NAMES.CONTENT_HIGHLIGHTS.DELETE_HIGHLIGHT_CANCEL}.clicked`,
      trackInfo,
    );
  };
  const handleDeleteClick = () => {
    const deleteHighlightSet = async () => {
      setDeletionState('pending');
      try {
        dispatch(enterpriseCurationActions.setHighlightToast(highlightSetUUID));
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
      history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.contentHighlights}`, {
        deletedHighlightSet: true,
      });
    }
  }, [isDeleted, close, highlightSetUUID, enterpriseSlug, history]);

  return (
    <>
      <Button variant="outline-primary" onClick={trackEventOpenDelete}>Delete highlight</Button>
      <AlertModal
        title="Delete highlight?"
        isOpen={isOpen}
        onClose={close}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={trackEventCloseDelete}>Cancel</Button>
            <StatefulButton
              labels={{
                default: 'Delete highlight',
                pending: 'Deleting highlight...',
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
          icon={Info}
        >
          <p>
            An error occurred while deleting this highlight collection. Please try again.
          </p>
        </Alert>
        <p>
          Deleting this highlight will remove it from your
          learners&apos; &quot;Find a Course&quot;. This action is permanent and cannot be undone.
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

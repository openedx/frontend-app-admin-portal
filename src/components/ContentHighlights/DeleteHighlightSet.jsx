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

import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';
import { enterpriseCurationActions } from '../EnterpriseApp/data/enterpriseCurationReducer';

function DeleteHighlightSet({ enterpriseSlug }) {
  const { highlightSetUUID } = useParams();
  const [isOpen, open, close] = useToggle(false);
  const [deletionState, setDeletionState] = useState('default');
  const history = useHistory();
  const { enterpriseCuration: { dispatch } } = useContext(EnterpriseAppContext);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deletionError, setDeletionError] = useState(null);

  const handleDeleteClick = () => {
    const deleteHighlightSet = async () => {
      setDeletionState('pending');
      try {
        await EnterpriseCatalogApiService.deleteHighlightSet(highlightSetUUID);
        dispatch(enterpriseCurationActions.deleteHighlightSet(highlightSetUUID));
        setIsDeleted(true);
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
        // TODO: expose the highlight set name here so it can be
        // displayed in the Toast notification. once ContentHighlights has
        // a reducer in its context value, we can use that to communicate between
        // components instead of history's location state.
        deletedHighlightSet: true,
      });
    }
  }, [isDeleted, close, highlightSetUUID, enterpriseSlug, history]);

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
          Deleting this highlight collection will remove it from your
          learners. This action is permanent and cannot be undone.
        </p>
      </AlertModal>
    </>
  );
}

DeleteHighlightSet.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(DeleteHighlightSet);

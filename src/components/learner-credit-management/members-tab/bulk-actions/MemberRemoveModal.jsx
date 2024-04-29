import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  ActionRow, Alert, Hyperlink, Icon, ModalDialog, Spinner, StatefulButton,
} from '@edx/paragon';
import { RemoveCircle } from '@edx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';

import { useRequestState } from '../../../subscriptions/licenses/LicenseManagementModals/LicenseManagementModalHook';
import { configuration } from '../../../../config';
import LmsApiService from '../../../../data/services/LmsApiService';

/**
 * Returns StatefulButton labels
 * @param {number} totalToRemove
 * @returns {Object}
 */
const generateRemoveModalSubmitLabel = (totalToRemove) => {
  let buttonNumberLabel = 'all';

  if (Number.isFinite(totalToRemove)) {
    buttonNumberLabel = `(${totalToRemove})`;
  }

  return {
    default: `Remove ${buttonNumberLabel}`,
    pending: `Removing ${buttonNumberLabel}`,
    complete: 'Done',
    error: `Retry remove ${buttonNumberLabel}`,
  };
};

const MemberRemoveModal = ({
  isOpen,
  onClose,
  onSuccess,
  usersToRemove,
  removeAllUsers,
  totalToRemove,
  groupUuid,
}) => {
  const [requestState, setRequestState, initialRequestState] = useRequestState(isOpen);

  const buttonLabels = generateRemoveModalSubmitLabel(totalToRemove);

  const title = `Remove member${removeAllUsers || totalToRemove > 1 ? 's' : ''}?`;

  const handleSubmit = useCallback(async () => {
    setRequestState({ ...initialRequestState, loading: true });
    const makeRequest = () => {
      const userEmailsToRemove = usersToRemove.map((user) => user.original.memberDetails.userEmail);
      const requestBody = {
        learner_emails: userEmailsToRemove,
      };
      return LmsApiService.removeEnterpriseLearnersFromGroup(groupUuid, requestBody);
    };

    try {
      const response = await makeRequest();
      setRequestState({ ...initialRequestState, success: true });
      onSuccess(response);
    } catch (error) {
      logError(error);
      setRequestState({ ...initialRequestState, error });
    }
  }, [
    usersToRemove,
    initialRequestState,
    onSuccess,
    setRequestState,
    groupUuid,
  ]);

  const handleClose = () => {
    if (!requestState.loading) {
      onClose();
    }
  };

  const getRemoveButtonState = () => {
    if (requestState.error) {
      return 'error';
    }
    if (requestState.loading) {
      return 'pending';
    }
    if (requestState.success) {
      return 'complete';
    }
    return 'default';
  };

  return (
    <ModalDialog
      title={title}
      isOpen={isOpen}
      onClose={handleClose}
      hasCloseButton={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {title}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        {requestState.error
            && (
            <Alert variant="danger">
              <p>There was an error with your request. Please try again.</p>
              <p>
                If the error persists,{' '}
                <Hyperlink destination={configuration.ENTERPRISE_SUPPORT_URL}>
                  contact customer support.
                </Hyperlink>
              </p>
            </Alert>
            )}
        <p>This action cannot be undone.</p>
        <p>
          The members will be notified and immediately lose access to browse the catalog
          and enroll using this budget’s available Learner Credit balance. Removal will
          not impact any current or past enrollments the members may have originated
          through this budget.
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            Go back
          </ModalDialog.CloseButton>
          <StatefulButton
            state={getRemoveButtonState()}
            variant="danger"
            onClick={handleSubmit}
            disabled={(!removeAllUsers && usersToRemove.length < 1)}
            labels={buttonLabels}
            data-testid="modal-remove-button"
            icons={{
              default: <Icon src={RemoveCircle} />,
              pending: <Spinner animation="border" variant="light" size="sm" />,
            }}
            disabledStates={['pending', 'complete']}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

MemberRemoveModal.defaultProps = {
  removeAllUsers: false,
  totalToRemove: -1,
};

MemberRemoveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  /** Function executed after successful remind request resolved */
  onSuccess: PropTypes.func.isRequired,
  usersToRemove: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
  ).isRequired,
  removeAllUsers: PropTypes.bool,
  totalToRemove: PropTypes.number,
  groupUuid: PropTypes.string.isRequired,
};

export default MemberRemoveModal;

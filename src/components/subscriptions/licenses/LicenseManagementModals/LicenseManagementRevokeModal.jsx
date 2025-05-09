import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import {
  ActionRow, Alert, Hyperlink, Icon, ModalDialog, Spinner, StatefulButton,
} from '@openedx/paragon';
import { RemoveCircle } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { useRequestState } from './LicenseManagementModalHook';
import { configuration } from '../../../../config';
import { SHOW_REVOCATION_CAP_PERCENT } from '../../data/constants';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import { transformFiltersForRequest } from '../../data/utils';

/**
 * Compute if alert should be rendered to warn admin they are approaching revocation limit.
 * @param {boolean} revocationCapEnabled
 * @param {Object} revocations  {applied: number, remaining: number}
 * @returns {boolean}
 */
const showRevocationCapAlert = (revocationCapEnabled, revocations) => {
  if (!revocationCapEnabled || !revocations) {
    return false;
  }
  // only show the revocation cap messaging if the number of applied revocations exceeds X% of
  // the number of revocations remaining for the subscription plan.
  const revocationCapLimit = revocations.remaining * (SHOW_REVOCATION_CAP_PERCENT / 100);
  return revocations.applied > revocationCapLimit;
};

/**
 * Returns StatefulButton labels
 * @param {number} totalToRevoke
 * @returns {Object}
 */
const generateRevokeModalSubmitLabel = (totalToRevoke) => {
  let buttonNumberLabel = 'all';

  if (Number.isFinite(totalToRevoke)) {
    buttonNumberLabel = `(${totalToRevoke})`;
  }

  return {
    default: `Revoke ${buttonNumberLabel}`,
    pending: `Revoking ${buttonNumberLabel}`,
    complete: 'Done',
    error: `Retry revoke ${buttonNumberLabel}`,
  };
};

const LicenseManagementRevokeModal = ({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
  subscription,
  usersToRevoke,
  revokeAllUsers,
  totalToRevoke,
  activeFilters,
}) => {
  const [requestState, setRequestState, initialRequestState] = useRequestState(isOpen);

  const buttonLabels = generateRevokeModalSubmitLabel(totalToRevoke);

  const title = `Revoke License${revokeAllUsers || totalToRevoke > 1 ? 's' : ''}`;

  const isExpired = dayjs().isAfter(subscription.expirationDate);
  const LICENSE_NOT_FOUND_ERROR_CODE = 404;
  const REQUEST_EXCEEDS_REMAINING_REVOCATIONS_ERROR_CODE = 400;

  const handleErrorMessages = (errorMessages) => {
    // Treat LICENSE_NOT_FOUND_ERROR_CODE errors as successful revocations to handle already revoked licenses
    // This allows the process to continue for valid licenses and avoids unnecessary
    // errors when users retry with already revoked emails
    if (errorMessages && errorMessages.length > 0) {
      const non404Errors = errorMessages.filter(
        (error) => error.error_response_status !== LICENSE_NOT_FOUND_ERROR_CODE,
      );
      if (non404Errors.length > 0) {
        throw non404Errors;
      }
    }
  };

  const bulkRevokeUsers = useCallback(async (options) => {
    try {
      const response = await LicenseManagerApiService.licenseBulkRevoke(
        subscription.uuid,
        options,
      );

      if (response.status === 207) {
        // Case 1: Partial revocation success
        handleErrorMessages(response.data.unsuccessful_revocations);
        return response.data;
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === REQUEST_EXCEEDS_REMAINING_REVOCATIONS_ERROR_CODE || status === LICENSE_NOT_FOUND_ERROR_CODE) {
          // Case 2: All revocations failed
          handleErrorMessages(data.unsuccessful_revocations);
          return data; // treat this as success if all errors were LICENSE_NOT_FOUND_ERROR_CODE
        }
      }
      throw error;
    }
  }, [subscription.uuid]);

  const handleSubmit = useCallback(async () => {
    if (onSubmit) {
      onSubmit();
    }
    setRequestState({ ...initialRequestState, loading: true });
    const makeRequest = async () => {
      const filtersPresent = activeFilters.length > 0;
      const options = {};
      // If all users are selected and there are no filters, hit revoke-all endpoint
      if (revokeAllUsers) {
        if (!filtersPresent) {
          return LicenseManagerApiService.licenseRevokeAll(subscription.uuid);
        }
        options.filters = transformFiltersForRequest(activeFilters);
        return bulkRevokeUsers(options);
      }
      // If all users not selected, then hit bulk-revoke with the emails loaded into the UI
      const userEmailsToRevoke = usersToRevoke.map((user) => user.email);
      if (userEmailsToRevoke.length > 0) {
        options.user_emails = userEmailsToRevoke;
      } else {
        // If the UI happened to render bulk actions without any state set for the table or just a filter is set
        // with no selected items.
        logError('Unable to revoke license(s) based on table state. No licenses selected for revocation');
        throw new Error('Unable to revoke license(s) based on table state');
      }
      return bulkRevokeUsers(options);
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
    onSubmit,
    setRequestState,
    initialRequestState,
    activeFilters,
    revokeAllUsers,
    usersToRevoke,
    bulkRevokeUsers,
    subscription.uuid,
    onSuccess,
  ]);

  const handleClose = () => {
    if (!requestState.loading) {
      onClose();
    }
  };

  const getRevokeButtonState = () => {
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
      isOverflowVisible={false}
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
              {requestState.error?.map?.((err, index) => (
                <p key={err.error}>{`Error: ${index + 1}: ${err.error}`}</p>
              ))}
            </Alert>
            )}
        {showRevocationCapAlert(subscription.isRevocationCapEnabled, subscription.revocations)
            && (
            <Alert variant="warning">
              You have already revoked {subscription.revocations.applied} licenses. You
              have {subscription.revocations.remaining} revocations left on your plan.
            </Alert>
            )}
        <p>This action cannot be undone. Learners with revoked licenses must be reinvited.</p>
        <p>
          <Hyperlink
            variant="muted"
            destination={configuration.ENTERPRISE_SUPPORT_REVOKE_LICENSE_URL}
          >
            Learn more about revoking subscription licenses.
          </Hyperlink>
        </p>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary">
            Cancel
          </ModalDialog.CloseButton>
          <StatefulButton
            state={getRevokeButtonState()}
            variant="danger"
            onClick={handleSubmit}
            disabled={(!revokeAllUsers && usersToRevoke.length < 1) || isExpired}
            labels={buttonLabels}
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

LicenseManagementRevokeModal.defaultProps = {
  revokeAllUsers: false,
  totalToRevoke: -1,
  onSubmit: undefined,
};

LicenseManagementRevokeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  /** Function executed after successful remind request resolved */
  onSuccess: PropTypes.func.isRequired,
  /** Function executed when submit button is pressed */
  onSubmit: PropTypes.func,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
    isRevocationCapEnabled: PropTypes.bool.isRequired,
    revocations: PropTypes.shape({
      applied: PropTypes.number.isRequired,
      remaining: PropTypes.number.isRequired,
    }),
  }).isRequired,
  usersToRevoke: PropTypes.arrayOf(
    PropTypes.shape({
      email: PropTypes.string.isRequired,
    }),
  ).isRequired,
  revokeAllUsers: PropTypes.bool,
  totalToRevoke: PropTypes.number,
  activeFilters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      filter: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      filterValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    }),
  ).isRequired,
};

export default LicenseManagementRevokeModal;

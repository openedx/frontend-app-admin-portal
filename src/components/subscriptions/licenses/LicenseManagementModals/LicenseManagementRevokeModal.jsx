import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import {
  Alert,
  StatefulButton,
  ModalDialog,
  ActionRow,
  Hyperlink,
  Icon,
  Spinner,
} from '@edx/paragon';
import {
  RemoveCircle,
} from '@edx/paragon/icons';
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

  const handleSubmit = useCallback(async () => {
    if (onSubmit) {
      onSubmit();
    }
    setRequestState({ ...initialRequestState, loading: true });
    const makeRequest = () => {
      const filtersPresent = activeFilters.length > 0;

      // If all users are selected and there are no filters, hit revoke-all endpoint
      if (revokeAllUsers && !filtersPresent) {
        return LicenseManagerApiService.licenseRevokeAll(subscription.uuid);
      }

      // If all users not selected, then hit bulk-revoke with the emails loaded into the UI
      const userEmailsToRevoke = usersToRevoke.map((user) => user.email);

      const options = {};
      if (userEmailsToRevoke.length > 0) {
        options.user_emails = userEmailsToRevoke;
      } else {
        options.filters = transformFiltersForRequest(activeFilters);
      }

      return LicenseManagerApiService.licenseBulkRevoke(subscription.uuid, options);
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
    activeFilters,
    revokeAllUsers,
    usersToRevoke,
    subscription.uuid,
    initialRequestState,
    onSuccess,
    setRequestState,
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

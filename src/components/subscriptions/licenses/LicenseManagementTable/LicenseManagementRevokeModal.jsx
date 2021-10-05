import React, { useState } from 'react';
import PropTypes from 'prop-types';
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

import { configuration } from '../../../../config';
import { SHOW_REVOCATION_CAP_PERCENT } from '../../data/constants';
import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';

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

const initialRequestState = {
  error: undefined,
  loading: false,
};

const LicenseManagementRevokeModal = ({
  isOpen,
  onClose,
  onSuccess,
  subscription,
  usersToRevoke,
}) => {
  const [requestState, setRequestState] = useState(initialRequestState);

  const numberToRevoke = usersToRevoke.length;
  const title = `Revoke License${numberToRevoke > 1 ? 's' : ''}`;

  const handleSubmit = () => {
    setRequestState({ ...initialRequestState, loading: true });

    const userEmailsToRevoke = usersToRevoke.map((user) => user.email);
    const options = { user_emails: userEmailsToRevoke };
    LicenseManagerApiService.licenseBulkRevoke(subscription.uuid, options)
      .then((response) => {
        setRequestState(initialRequestState);
        onSuccess(response);
      })
      .catch((error) => {
        logError(error);
        setRequestState({ ...initialRequestState, error });
      });
  };

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
                If the error persists,&nbsp;
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
        <p>This action cannot be undone. Learners with revoked licenses must be reinvited. </p>
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
            {...{
              labels: {
                default: `Revoke (${numberToRevoke})`,
                pending: `Revoking (${numberToRevoke})`,
                complete: 'Done',
                error: `Retry Revoke (${numberToRevoke})`,
              },
              icons: {
                default: <Icon src={RemoveCircle} />,
                pending: <Spinner animation="border" variant="light" size="sm" />,
              },
              disabledStates: ['pending', 'complete'],
            }}
          />
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

LicenseManagementRevokeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  subscription: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
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
};

export default LicenseManagementRevokeModal;

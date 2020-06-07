import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import './styles/LicenseActions.scss';
import ActionButtonWithModal from '../ActionButtonWithModal';
import LicenseRemindModal from '../../containers/LicenseRemindModal';
import LicenseRevokeModal from '../../containers/LicenseRevokeModal';
import { StatusContext } from './SubscriptionManagementPage';

export default function LicenseAction({ user }) {
  const { setSuccessStatus } = useContext(StatusContext);

  const licenseActions = useMemo(
    () => {
      switch (user.licenseStatus) {
        case 'active':
          return [{
            text: 'Revoke',
            // eslint-disable-next-line no-console
            handleClick: closeModal => (<LicenseRevokeModal
              user={user}
              onSuccess={() => setSuccessStatus({
                visible: true,
                message: 'Successfully revoked license',
              })}
              onClose={() => {
                closeModal();
              }}
            />),
          }];
        case 'assigned':
          return [{
            text: 'Remind',
            // eslint-disable-next-line no-console
            handleClick: closeModal => (
              <LicenseRemindModal
                user={user}
                isBulkRemind={false}
                title="Remind User"
                onSuccess={() => setSuccessStatus({
                  visible: true,
                  message: 'Successfully sent reminder(s)',
                })}
                onClose={() => {
                  closeModal();
                }}
              />
            ),
          }, {
            text: 'Revoke',
            // eslint-disable-next-line no-console
            handleClick: closeModal => (
              <LicenseRevokeModal
                user={user}
                onSuccess={() => setSuccessStatus({
                  visible: true,
                  message: 'Successfully revoked license',
                })}
                onClose={() => {
                  closeModal();
                }}
              />
            ),
          }];
        default:
          return [{ text: '-' }];
      }
    },
    [user],
  );
  return (
    <div className="license-actions">
      {licenseActions.map((licenseAction) => {
        if (licenseAction.handleClick) {
          return (
            <ActionButtonWithModal
              buttonLabel={licenseAction.text}
              buttonClassName="btn btn-link btn-sm p-0"
              renderModal={({ closeModal }) => (
                licenseAction.handleClick(closeModal)
              )}
            />
          );
        }
        return licenseAction.text;
      })}
    </div>
  );
}

LicenseAction.propTypes = {
  user: PropTypes.shape({
    licenseStatus: PropTypes.string.isRequired,
  }).isRequired,
};

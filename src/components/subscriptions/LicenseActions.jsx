import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import './styles/LicenseActions.scss';
import ActionButtonWithModal from '../ActionButtonWithModal';
import LicenseRemindModal from '../../containers/LicenseRemindModal';
import { StatusContext } from './SubscriptionManagementPage';

export default function LicenseAction({ user }) {
  const setStatus = useContext(StatusContext);

  const setSuccessStatus = (message) => {
    setStatus({
      visible: true,
      alertType: 'success',
      message,
    });
  };
  const licenseActions = useMemo(
    () => {
      switch (user.licenseStatus) {
        case 'active':
          return [{
            text: 'Revoke',
            // eslint-disable-next-line no-console
            handleClick: () => { console.log('Revoke clicked for', user); },
          }];
        case 'assigned':
          return [{
            text: 'Remind',
            // eslint-disable-next-line no-console
            handleClick: closeModal => (<LicenseRemindModal
              user={user}
              isBulkRemind={false}
              title="Remind User"
              subtitle=""
              onSuccess={() => setSuccessStatus('Successfully sent reminder(s)')}
              onClose={() => {
                closeModal();
              }}
            />),
          }, {
            text: 'Revoke',
            // eslint-disable-next-line no-console
            handleClick: () => { console.log('Revoke clicked for', user); },
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

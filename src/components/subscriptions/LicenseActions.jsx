import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import './styles/LicenseActions.scss';

export default function LicenseAction({ user }) {
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
            handleClick: () => { console.log('Remind clicked for', user); },
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
            <button
              key={licenseAction.text}
              className="btn btn-link btn-sm p-0"
              onClick={() => licenseAction.handleClick()}
            >
              {licenseAction.text}
            </button>
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

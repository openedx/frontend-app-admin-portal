import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './styles/LicenseStatus.scss';

export default function LicenseStatus({ user }) {
  const licenseStatus = useMemo(
    () => {
      switch (user.licenseStatus) {
        case 'active':
          return {
            iconClassName: 'fa-check-circle text-success',
            text: 'Active',
          };
        case 'assigned':
          return {
            iconClassName: 'fa-hourglass-half text-muted',
            text: <>Pending<br /><p>Since {user.pendingSince}</p></>,  /* eslint-disable-line */
          };
        case 'deactivated':
          return {
            iconClassName: 'fa-times-circle text-danger',
            text: 'Deactivated',
          };
        default:
          return {
            text: '-',
          };
      }
    },
    [user],
  );

  return (
    <React.Fragment>
      {licenseStatus.iconClassName && (
        <i className={classNames('fa mr-2', licenseStatus.iconClassName)} />
      )}
      {licenseStatus.text}
    </React.Fragment>
  );
}

LicenseStatus.propTypes = {
  user: PropTypes.shape({
    licenseStatus: PropTypes.string.isRequired,
    pendingSince: PropTypes.string.isRequired,
  }).isRequired,
};

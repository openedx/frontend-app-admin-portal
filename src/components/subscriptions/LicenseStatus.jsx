import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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
            text: 'Pending',
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
  }).isRequired,
};

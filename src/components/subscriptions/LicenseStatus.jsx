import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatTimestamp } from '../../utils';
import { ACTIVATED, ASSIGNED, REVOKED } from './constants';

export default function LicenseStatus({ user }) {
  const licenseStatus = useMemo(
    () => {
      switch (user.status) {
        case ACTIVATED:
          return {
            iconClassName: 'fa-check-circle text-success',
            text: 'Activated',
          };
        case ASSIGNED:
          return {
            iconClassName: 'fa-hourglass-half text-muted',
            text: (
              <>
                <span>Pending</span>
                {
                  user.lastRemindDate && (
                    <span className="d-block text-muted">
                      Since { formatTimestamp({ timestamp: user.lastRemindDate })}
                    </span>
                  )
                }
              </>
            ),
          };
        case REVOKED:
          return {
            iconClassName: 'fa-times-circle text-danger',
            text: 'Revoked',
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
    <>
      {licenseStatus.iconClassName && (
        <i className={classNames('fa mr-2', licenseStatus.iconClassName)} />
      )}
      {licenseStatus.text}
    </>
  );
}

LicenseStatus.propTypes = {
  user: PropTypes.shape({
    status: PropTypes.string.isRequired,
    lastRemindDate: PropTypes.string,
  }).isRequired,
};

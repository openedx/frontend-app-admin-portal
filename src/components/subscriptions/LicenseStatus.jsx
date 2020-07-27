import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatTimestamp } from '../../utils';
import { ACTIVATED, ASSIGNED, DEACTIVATED } from './constants';

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
              <React.Fragment>
                <span>Pending</span>
                {
                  user.lastRemindDate && (
                    <span className="d-block text-muted">
                      Since { formatTimestamp({ timestamp: user.lastRemindDate })}
                    </span>
                  )
                }
              </React.Fragment>
            ),
          };
        case DEACTIVATED:
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
    status: PropTypes.string.isRequired,
    lastRemindDate: PropTypes.string,
  }).isRequired,
};

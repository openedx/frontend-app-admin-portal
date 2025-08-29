import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
} from '@openedx/paragon';

import {
  USER_STATUS_BADGE_MAP,
  ACTIVATED,
  ASSIGNED,
  REVOKED,
} from '../../data/constants';

const LicenseManagementUserBadge = ({ userStatus }) => {
  const badgeLabel = USER_STATUS_BADGE_MAP[userStatus];

  if (badgeLabel) {
    return <Badge variant={badgeLabel.variant}>{badgeLabel.label}</Badge>;
  }
  // If userStatus is undefined return no badge
  return null;
};

LicenseManagementUserBadge.propTypes = {
  userStatus: PropTypes.oneOf([ACTIVATED, ASSIGNED, REVOKED]).isRequired,
};

export default LicenseManagementUserBadge;

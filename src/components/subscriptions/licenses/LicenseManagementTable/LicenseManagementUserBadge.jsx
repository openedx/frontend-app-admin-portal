import React from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
} from '@edx/paragon';

import { USER_BADGE_MAP } from '../../data/constants';

const LicenseManagementUserBadge = ({ userStatus }) => {
  const badgeLabel = USER_BADGE_MAP[userStatus]
    ? USER_BADGE_MAP[userStatus]
    : USER_BADGE_MAP.UNDEFINED;
  return <Badge variant={badgeLabel.variant}>{badgeLabel.label}</Badge>;
};

export default LicenseManagementUserBadge;

LicenseManagementUserBadge.propTypes = {
  userStatus: PropTypes.string.isRequired,
};

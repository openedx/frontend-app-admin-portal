import React from 'react';
import PropTypes from 'prop-types';

import Accepted from './status-chips/Accepted';
import FailedSystem from './status-chips/FailedSystem';
import FailedBadEmail from './status-chips/FailedBadEmail';
import Pending from './status-chips/Pending';
import Removed from './status-chips/Removed';

const MemberStatusTableCell = ({ row }) => {
  if (row.original.status === 'pending') {
    return (
      <Pending row={row} />
    );
  } if (row.original.status === 'accepted') {
    return (
      <Accepted />
    );
  } if (row.original.status === 'internal_api_error') {
    return (
      <FailedSystem />
    );
  } if (row.original.status === 'email_error') {
    return (
      <FailedBadEmail row={row} />
    );
  }
  return (
    <Removed />
  );
};

MemberStatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      status: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default MemberStatusTableCell;

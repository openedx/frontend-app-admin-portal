import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@openedx/paragon';

import {
  Timelapse, CheckCircle, RemoveCircle,
} from '@openedx/paragon/icons';

const MemberStatusTableCell = ({
  row,
}) => {
  let icon;
  let text;
  if (row.original.status === 'pending') {
    icon = Timelapse;
    text = 'Waiting for member';
  } else if (row.original.status === 'accepted') {
    icon = CheckCircle;
    text = 'Accepted';
  } else {
    icon = RemoveCircle;
    text = 'Removed';
  }
  return (
    <Chip
      className="bg-light-100 border border-gray-300 rounded"
      iconBefore={icon}
    >
      {text}
    </Chip>
  );
};

MemberStatusTableCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      memberDetails: PropTypes.shape({
        userEmail: PropTypes.string.isRequired,
        userName: PropTypes.string,
      }),
      status: PropTypes.string,
      recentAction: PropTypes.string.isRequired,
      memberEnrollments: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default MemberStatusTableCell;

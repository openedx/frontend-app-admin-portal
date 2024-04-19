import React from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Stack,
  Icon,
} from '@edx/paragon';
import {
  Person,
} from '@edx/paragon/icons';

const MemberDetailsTableCell = ({
  row,
}) => {
  let memberDetails;
  let memberDetailIcon = (
    <IconButton
      isActive
      invertColors
      src={Person}
      iconAs={Icon}
      className="border rounded-circle mr-3"
      alt="members detail column icon"
    />
  );
  if (row.original.status === 'removed') {
    memberDetails = (
      <div className="mb-n3">
        <p className="text-danger-900 font-weight-bold text-uppercase x-small mb-0">
          FORMER MEMBER
        </p>
        <p>{row.original.memberDetails.userEmail}</p>
      </div>
    );
    memberDetailIcon = (
      <IconButton
        isActive
        invertColors
        src={Person}
        iconAs={Icon}
        className="border border-gray-400 rounded-circle  mr-3"
        alt="members detail column icon"
        style={{ opacity: 0.2 }}
      />
    );
  } else if (row.original.memberDetails.userName) {
    memberDetails = (
      <div className="mb-n3">
        <p className="font-weight-bold mb-0">
          {row.original.memberDetails.userName}
        </p>
        <p>{row.original.memberDetails.userEmail}</p>
      </div>
    );
  } else {
    memberDetails = (
      <p className="align-middle mb-0">
        {row.original.memberDetails.userEmail}
      </p>
    );
  }
  return (
    <Stack gap={0} direction="horizontal">
      {memberDetailIcon}
      {memberDetails}
    </Stack>
  );
};

MemberDetailsTableCell.propTypes = {
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

export default MemberDetailsTableCell;

import React from 'react';
import PropTypes from 'prop-types';
import {
  Chip, Icon, Hyperlink, OverlayTrigger, Popover,
} from '@openedx/paragon';
import {
  CheckCircle, RemoveCircle, Timelapse,
} from '@openedx/paragon/icons';
import { HELP_CENTER_GROUPS_INVITE_LINK } from '../../settings/data/constants';

const MemberStatusTableCell = ({
  row,
}) => {
  let icon;
  let text;
  let popoverHeader;
  let popoverBody;
  let popoverExtra1;
  let popoverExtra2;
  if (row.original.status === 'pending') {
    icon = Timelapse;
    text = 'Waiting for member';
    popoverHeader = `Waiting for ${row.original.memberDetails.userEmail}`;
    popoverBody = 'This member must accept their invitation to browse this budget\'s catalog '
    + 'and enroll using their member permissions by logging in or creating an account within 90 days.';
    popoverExtra1 = 'Need help?';
    popoverExtra2 = 'Learn more about adding budget members in Learner Credit at ';
  } else if (row.original.status === 'accepted') {
    icon = CheckCircle;
    text = 'Accepted';
    popoverHeader = 'Invitation accepted';
    popoverBody = 'This member has successfully accepted the member invitation and can '
    + 'now browse this budget\'s catalog and enroll using their member permissions.';
  } else {
    icon = RemoveCircle;
    text = 'Removed';
    popoverHeader = 'Member removed';
    popoverBody = 'This member has been successfully removed and can not browse this budget\'s '
    + 'catalog and enroll using their member permissions.';
    popoverExtra1 = 'Want to add them back?';
    popoverExtra2 = 'Follow the steps provided at ';
  }
  return (
    <OverlayTrigger
      trigger={['click']}
      key="status-badge-popover"
      placement="top"
      overlay={(
        <Popover id="status-popover">
          <Popover.Title as="h3">
            <Icon src={icon} />
            {popoverHeader}
          </Popover.Title>
          <Popover.Content>
            {popoverBody}
            {popoverExtra1 !== null && (
              <div>
                <p className="mt-2 mb-0 small"><strong>{popoverExtra1}</strong></p>
                <p className="mb-0 small">{popoverExtra2}
                  <Hyperlink target="_blank" destination={HELP_CENTER_GROUPS_INVITE_LINK}>
                    Help Center: Inviting Budget Members
                  </Hyperlink>
                </p>
              </div>
            )}
          </Popover.Content>
        </Popover>
  )}
    >
      <Chip
        className="bg-light-100 border border-gray-300 rounded"
        iconBefore={icon}
      >
        {text}
      </Chip>
    </OverlayTrigger>
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

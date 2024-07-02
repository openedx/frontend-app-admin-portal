import React from 'react';
import PropTypes from 'prop-types';
import {
  Chip, Icon, Hyperlink, OverlayTrigger, Popover,
} from '@openedx/paragon';
import {
  CheckCircle, RemoveCircle, Timelapse,
} from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { HELP_CENTER_GROUPS_INVITE_LINK } from '../../settings/data/constants';

const MemberStatusTableCell = ({
  row,
}) => {
  const intl = useIntl();
  let icon;
  let text;
  let popoverHeader;
  let popoverBody;
  let popoverExtra1;
  let popoverExtra2;
  if (row.original.status === 'pending') {
    icon = Timelapse;
    text = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pending',
      defaultMessage: 'Waiting for member',
      description: 'Status of the member invitation',
    });
    popoverHeader = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverHeader',
      defaultMessage: 'Waiting for {userEmail}',
      description: 'Popover header for the pending status',
    }, { userEmail: row.original.memberDetails.userEmail });
    popoverBody = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverBody',
      defaultMessage: "This member must accept their invitation to browse this budget's catalog and enroll using their member permissions by logging in or creating an account within 90 days.",
      description: 'Popover body for the pending status',
    });
    popoverExtra1 = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverExtra1',
      defaultMessage: 'Need help?',
      description: 'Extra text for the pending status',
    });
    popoverExtra2 = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverExtra2',
      defaultMessage: 'Learn more about adding budget members in Learner Credit at ',
      description: 'Extra text for the pending status',
    });
  } else if (row.original.status === 'accepted') {
    icon = CheckCircle;
    text = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.accepted',
      defaultMessage: 'Accepted',
      description: 'Status of the member invitation',
    });
    popoverHeader = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.acceptedPopoverHeader',
      defaultMessage: 'Invitation accepted',
      description: 'Popover header for the accepted status',
    });
    popoverBody = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.acceptedPopoverBody',
      defaultMessage: "This member has successfully accepted the member invitation and can now browse this budget's catalog and enroll using their member permissions.",
      description: 'Popover body for the accepted status',
    });
  } else {
    icon = RemoveCircle;
    text = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removed',
      defaultMessage: 'Removed',
      description: 'Status of the member invitation',
    });
    popoverHeader = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverHeader',
      defaultMessage: 'Member removed',
      description: 'Popover header for the removed status',
    });
    popoverBody = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverBody',
      defaultMessage: "This member has been successfully removed and can not browse this budget's catalog and enroll using their member permissions.",
      description: 'Popover body for the removed status',
    });
    popoverExtra1 = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverExtra1',
      defaultMessage: 'Want to add them back?',
      description: 'Extra text for the removed status',
    });
    popoverExtra2 = intl.formatMessage({
      id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverExtra2',
      defaultMessage: 'Follow the steps provided at ',
      description: 'Extra text for the removed status',
    });
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
                  <FormattedMessage
                    id="learnerCreditManagement.budgetDetail.membersTab.membersTable.helpCenterLink"
                    defaultMessage="<a>Help Center: Inviting Budget Members</a>"
                    description="Help Center link for inviting budget members"
                    values={{
                      // eslint-disable-next-line react/no-unstable-nested-components
                      a: (chunks) => (
                        <Hyperlink target="_blank" destination={HELP_CENTER_GROUPS_INVITE_LINK}>
                          {chunks}
                        </Hyperlink>
                      ),
                    }}
                  />
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

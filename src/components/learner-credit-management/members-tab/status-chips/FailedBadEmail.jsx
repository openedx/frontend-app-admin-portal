import { useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import { Error } from '@openedx/paragon/icons';
import BaseStatusChip from './BaseStatusChip';
import { LEARNER_CREDIT_MANAGEMENT_EVENTS as events } from '../../../../eventTracking';

const FailedBadEmail = ({ row }) => {
  const intl = useIntl();
  const icon = Error;
  const text = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedEmail',
    defaultMessage: 'Failed: Bad email',
    description: 'Status of the member invitation',
  });
  const popoverHeader = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedEmailPopoverHeader',
    defaultMessage: 'Failed: Bad email',
    description: 'Popover header for the failed email status',
  });
  const popoverBody = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedEmailPopoverBody',
    defaultMessage: 'This member invitation failed because a notification to {userEmail} could not be sent.',
    description: 'Popover body for the failed email status',
  }, { userEmail: row.original.memberDetails.userEmail });
  const popoverExtra1 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedEmailPopoverExtra1',
    defaultMessage: 'Resolution steps',
    description: 'Extra text for the failed email status',
  });
  const popoverExtra2 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedEmailPopoverExtra2',
    defaultMessage: 'Remove member from budget, ensure email is correct and re-invite. Get more troubleshooting help at ',
    description: 'Extra text for the failed email status',
  });
  return (
    <BaseStatusChip
      icon={icon}
      text={text}
      popoverHeader={popoverHeader}
      popoverBody={popoverBody}
      popoverExtra1={popoverExtra1}
      popoverExtra2={popoverExtra2}
      statusEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_FAILED_BAD_EMAIL}
      helpEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_FAILED_BAD_EMAIL_HELP_CENTER}
    />
  );
};

FailedBadEmail.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      memberDetails: PropTypes.shape({
        userEmail: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};

export default FailedBadEmail;

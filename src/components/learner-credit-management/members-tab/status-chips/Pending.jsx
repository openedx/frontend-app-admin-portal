import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Timelapse } from '@openedx/paragon/icons';
import BaseStatusChip from './BaseStatusChip';
import { LEARNER_CREDIT_MANAGEMENT_EVENTS as events } from '../../../../eventTracking';

const Pending = ({ row }) => {
  const intl = useIntl();
  const icon = Timelapse;
  const text = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pending',
    defaultMessage: 'Waiting for member',
    description: 'Status of the member invitation',
  });
  const popoverHeader = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverHeader',
    defaultMessage: 'Waiting for {userEmail}',
    description: 'Popover header for the pending status',
  }, { userEmail: row.original.memberDetails.userEmail });
  const popoverBody = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverBody',
    defaultMessage: "This member must accept their invitation to browse this budget's catalog and enroll using their member permissions by logging in or creating an account within 90 days.",
    description: 'Popover body for the pending status',
  });
  const popoverExtra1 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverExtra1',
    defaultMessage: 'Need help?',
    description: 'Extra text for the pending status',
  });
  const popoverExtra2 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.pendingPopoverExtra2',
    defaultMessage: 'Learn more about adding budget members in Learner Credit at ',
    description: 'Extra text for the pending status',
  });
  return (
    <BaseStatusChip
      icon={icon}
      text={text}
      popoverHeader={popoverHeader}
      popoverBody={popoverBody}
      popoverExtra1={popoverExtra1}
      popoverExtra2={popoverExtra2}
      statusEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_PENDING}
      helpEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_PENDING_HELP_CENTER}
    />
  );
};

Pending.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      memberDetails: PropTypes.shape({
        userEmail: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};

export default Pending;

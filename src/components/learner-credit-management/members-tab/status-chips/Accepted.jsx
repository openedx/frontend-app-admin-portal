import { useIntl } from '@edx/frontend-platform/i18n';
import { CheckCircle } from '@openedx/paragon/icons';
import BaseStatusChip from './BaseStatusChip';
import { LEARNER_CREDIT_MANAGEMENT_EVENTS as events } from '../../../../eventTracking';

const Accepted = () => {
  const intl = useIntl();
  const icon = CheckCircle;
  const text = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.accepted',
    defaultMessage: 'Accepted',
    description: 'Status of the member invitation',
  });
  const popoverHeader = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.acceptedPopoverHeader',
    defaultMessage: 'Invitation accepted',
    description: 'Popover header for the accepted status',
  });
  const popoverBody = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.acceptedPopoverBody',
    defaultMessage: "This member has successfully accepted the member invitation and can now browse this budget's catalog and enroll using their member permissions.",
    description: 'Popover body for the accepted status',
  });
  return (
    <BaseStatusChip
      icon={icon}
      text={text}
      popoverHeader={popoverHeader}
      popoverBody={popoverBody}
      statusEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_ACCEPTED}
      helpEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_ACCEPTED_HELP_CENTER}
    />
  );
};

export default Accepted;

import { useIntl } from '@edx/frontend-platform/i18n';
import { Error } from '@openedx/paragon/icons';
import BaseStatusChip from './BaseStatusChip';
import { LEARNER_CREDIT_MANAGEMENT_EVENTS as events } from '../../../../eventTracking';

const FailedSystem = () => {
  const intl = useIntl();
  const icon = Error;
  const text = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedSystem',
    defaultMessage: 'Failed: System',
    description: 'Status of the member invitation',
  });
  const popoverHeader = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedSystemPopoverHeader',
    defaultMessage: 'Failed: System',
    description: 'Popover header for the system failed status',
  });
  const popoverBody = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedSystemPopoverBody',
    defaultMessage: 'Something went wrong behind the scenes.',
    description: 'Popover body for the system failed status',
  });
  const popoverExtra1 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedSystemPopoverExtra1',
    defaultMessage: 'Need help?',
    description: 'Extra text for the system failed status',
  });
  const popoverExtra2 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.failedSystemPopoverExtra2',
    defaultMessage: 'Get help at ',
    description: 'Extra text for the system failed status',
  });
  return (
    <BaseStatusChip
      icon={icon}
      text={text}
      popoverHeader={popoverHeader}
      popoverBody={popoverBody}
      popoverExtra1={popoverExtra1}
      popoverExtra2={popoverExtra2}
      statusEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_FAILED_SYSTEM}
      helpEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_FAILED_SYSTEM_HELP_CENTER}
    />
  );
};

export default FailedSystem;

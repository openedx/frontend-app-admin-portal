import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';
import { RemoveCircle } from '@openedx/paragon/icons';
import BaseStatusChip from './BaseStatusChip';
import { LEARNER_CREDIT_MANAGEMENT_EVENTS as events } from '../../../../eventTracking';

const Removed = () => {
  const intl = useIntl();
  const icon = RemoveCircle;
  const text = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removed',
    defaultMessage: 'Removed',
    description: 'Status of the member invitation',
  });
  const popoverHeader = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverHeader',
    defaultMessage: 'Member removed',
    description: 'Popover header for the removed status',
  });
  const popoverBody = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverBody',
    defaultMessage: "This member has been successfully removed and can not browse this budget's catalog and enroll using their member permissions.",
    description: 'Popover body for the removed status',
  });
  const popoverExtra1 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverExtra1',
    defaultMessage: 'Want to add them back?',
    description: 'Extra text for the removed status',
  });
  const popoverExtra2 = intl.formatMessage({
    id: 'learnerCreditManagement.budgetDetail.membersTab.membersTable.removedPopoverExtra2',
    defaultMessage: 'Follow the steps provided at ',
    description: 'Extra text for the removed status',
  });
  return (
    <BaseStatusChip
      icon={icon}
      text={text}
      popoverHeader={popoverHeader}
      popoverBody={popoverBody}
      popoverExtra1={popoverExtra1}
      popoverExtra2={popoverExtra2}
      statusEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_REMOVED}
      helpEventName={events.MEMBERS_DATATABLE_STATUS_CHIP_REMOVED_HELP_CENTER}
    />
  );
};

Removed.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      memberDetails: PropTypes.shape({
        userEmail: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
};

export default Removed;

import React from 'react';
import {
  OverlayTrigger,
  Tooltip,
  Stack,
  Icon,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const MemberEnrollmentsTableColumnHeader = () => (
  <Stack gap={1} direction="horizontal">
    <span data-testid="members-table-enrollments-column-header">
      <FormattedMessage
        id="learnerCreditManagement.budgetDetail.membersTab.membersTable.enrollmentsColumn"
        defaultMessage="Enrollments"
        description="Enrollments column header in the Members table"
      />
    </span>
    <OverlayTrigger
      key="enrollments-column-tooltip"
      placement="top"
      overlay={(
        <Tooltip id="enrollments-column-tooltip">
          <div>
            <FormattedMessage
              id="learnerCreditManagement.budgetDetail.membersTab.membersTable.enrollmentsColumn.tooltip"
              defaultMessage="Total number of enrollment originated from the budget"
              description="Tooltip for the Enrollments column header in the Members table"
            />
          </div>
        </Tooltip>
      )}
    >
      <Icon size="xs" src={InfoOutline} className="ml-1 d-inline-flex" />
    </OverlayTrigger>
  </Stack>
);

export default MemberEnrollmentsTableColumnHeader;

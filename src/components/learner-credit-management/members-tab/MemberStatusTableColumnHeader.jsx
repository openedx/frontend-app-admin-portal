import React from 'react';
import {
  OverlayTrigger,
  Stack,
  Tooltip,
  Icon,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const MemberStatusTableColumnHeader = () => (
  <Stack gap={1} direction="horizontal">
    <span data-testid="members-table-status-column-header">
      <FormattedMessage
        id="learnerCreditManagement.budgetDetail.membersTab.membersTable.statusColumn"
        defaultMessage="Status"
        description="Status column header in the Members table"
      />
    </span>
    <OverlayTrigger
      key="status-column-tooltip"
      placement="top"
      overlay={(
        <Tooltip id="status-column-tooltip">
          <div>
            <FormattedMessage
              id="learnerCreditManagement.budgetDetail.membersTab.membersTable.statusColumn.tooltip"
              defaultMessage="Status of the member invitation."
              description="Tooltip for the Status column header in the Members table"
            />
          </div>
        </Tooltip>
      )}
    >
      <Icon size="xs" src={InfoOutline} className="ml-1 d-inline-flex" />
    </OverlayTrigger>
  </Stack>
);

export default MemberStatusTableColumnHeader;

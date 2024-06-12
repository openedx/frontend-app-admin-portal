import React from 'react';
import {
  Stack,
  Icon,
  IconButtonWithTooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  header: {
    id: 'lcm.budget.detail.page.assignments.table.columns.enroll-by-date.header',
    defaultMessage: 'Enroll-by date',
    description: 'Column header for the enroll-by date column in the assignments table',
  },
  headerTooltipContent: {
    id: 'lcm.budget.detail.page.assignments.table.columns.enroll-by-date.header.tooltip-content',
    defaultMessage: 'Failure to enroll by midnight of enrollment deadline date will release funds back into the budget',
    description: 'On hover tool tip message for the enroll-by date column',
  },
});

const AssignmentEnrollByDateHeader = () => {
  const intl = useIntl();
  return (
    <Stack gap={1} direction="horizontal">
      <span data-testid="assignments-table-enroll-by-column-header">
        {intl.formatMessage(messages.header)}
      </span>
      <IconButtonWithTooltip
        tooltipContent={intl.formatMessage(messages.headerTooltipContent)}
        tooltipPlacement="right"
        src={InfoOutline}
        iconAs={Icon}
        size="inline"
        data-testid="enroll-by-date-tooltip"
      />
    </Stack>
  );
};

export default AssignmentEnrollByDateHeader;

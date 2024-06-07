import React from 'react';
import {
  Stack,
  Icon,
  IconButtonWithTooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

const AssignmentEnrollByDateHeader = () => {
  const intl = useIntl();
  const internationalizedToolTipContent = intl.formatMessage({
    id: 'lcm.budget.detail.page.assignments.table.columns.enroll.by.date.tool.tip.content',
    defaultMessage: 'Failure to enroll by midnight of enrollment deadline date will release funds back into the budget',
    description: 'On hover tool tip message for the enroll-by date column',
  });
  return (
    <Stack gap={0} direction="horizontal">
      <span>
        <p data-testid="assignments-table-enroll-by-column-header" className="mb-0 mr-1">
          {intl.formatMessage({
            id: 'lcm.budget.detail.page.assignments.table.columns.enroll.by.date',
            defaultMessage: 'Enroll-by date',
            description: 'Column header for the recent action column in the assignments table',
          })}
        </p>
      </span>
      <IconButtonWithTooltip
        tooltipContent={internationalizedToolTipContent}
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

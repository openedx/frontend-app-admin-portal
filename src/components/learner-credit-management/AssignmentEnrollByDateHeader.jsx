import React from 'react';
import {
  Stack,
  Icon,
  IconButtonWithTooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

const AssignmentEnrollByDateHeader = () => (
  <Stack gap={0} direction="horizontal">
    <span>
      <p data-testid="assignments-table-enroll-by-column-header" className="mb-0 mr-1">Enroll-by date</p>
    </span>
    <IconButtonWithTooltip
      invertColors
      isActive
      tooltipContent="Failure to enroll by midnight of enrollment deadline date will release funds back into the budget"
      tooltipPlacement="right"
      src={InfoOutline}
      iconAs={Icon}
      size="sm"
      className="bg-transparent"
    />
  </Stack>
);

export default AssignmentEnrollByDateHeader;

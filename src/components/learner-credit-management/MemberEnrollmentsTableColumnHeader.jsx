import React from 'react';
import {
  OverlayTrigger,
  Tooltip,
  Stack,
  Icon,
} from '@edx/paragon';
import { InfoOutline } from '@edx/paragon/icons';

const MemberEnrollmentsTableColumnHeader = () => (
  <Stack gap={0} direction="horizontal">
    <span>
      <p data-testid="members-table-enrollments-column-header" className="mb-0 mr-1">Enrollments</p>
    </span>
    <OverlayTrigger
      key="enrollments-column-tooltip"
      placement="top"
      overlay={(
        <Tooltip>
          <div>Total number of enrollment originated from the budget</div>
        </Tooltip>
      )}
    >
      <Icon size="xs" src={InfoOutline} className="ml-1 d-inline-flex" />
    </OverlayTrigger>
  </Stack>
);

export default MemberEnrollmentsTableColumnHeader;

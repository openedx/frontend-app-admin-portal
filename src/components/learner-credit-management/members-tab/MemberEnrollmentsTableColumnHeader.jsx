import React from 'react';
import {
  OverlayTrigger,
  Tooltip,
  Stack,
  Icon,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

const MemberEnrollmentsTableColumnHeader = () => (
  <Stack gap={1} direction="horizontal">
    <span>
      Enrollments
    </span>
    <OverlayTrigger
      key="enrollments-column-tooltip"
      placement="top"
      overlay={(
        <Tooltip id="enrollments-column-tooltip">
          <div>Total number of enrollment originated from the budget</div>
        </Tooltip>
      )}
    >
      <Icon size="xs" src={InfoOutline} className="ml-1 d-inline-flex" />
    </OverlayTrigger>
  </Stack>
);

export default MemberEnrollmentsTableColumnHeader;

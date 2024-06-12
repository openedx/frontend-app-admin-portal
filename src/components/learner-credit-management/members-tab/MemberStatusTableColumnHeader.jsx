import React from 'react';
import {
  OverlayTrigger,
  Stack,
  Tooltip,
  Icon,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';

const MemberStatusTableColumnHeader = () => (
  <Stack gap={1} direction="horizontal">
    <span data-testid="members-table-status-column-header">
      Status
    </span>
    <OverlayTrigger
      key="status-column-tooltip"
      placement="top"
      overlay={(
        <Tooltip id="status-column-tooltip">
          <div>Status of the member invitation.</div>
        </Tooltip>
      )}
    >
      <Icon size="xs" src={InfoOutline} className="ml-1 d-inline-flex" />
    </OverlayTrigger>
  </Stack>
);

export default MemberStatusTableColumnHeader;

import React from 'react';
import {
  OverlayTrigger,
  Stack,
  Tooltip,
  Icon,
} from '@edx/paragon';
import { InfoOutline } from '@edx/paragon/icons';

const MemberStatusTableColumnHeader = () => (
  <Stack gap={0} direction="horizontal">
    <span>
      <p data-testid="members-table-status-column-header" className="mb-0 mr-1">Status</p>
    </span>
    <OverlayTrigger
      key="status-column-tooltip"
      placement="top"
      overlay={(
        <Tooltip>
          <div>Status of the member invitation.</div>
        </Tooltip>
      )}
    >
      <Icon size="xs" src={InfoOutline} className="ml-1 d-inline-flex" />
    </OverlayTrigger>
  </Stack>
);

export default MemberStatusTableColumnHeader;

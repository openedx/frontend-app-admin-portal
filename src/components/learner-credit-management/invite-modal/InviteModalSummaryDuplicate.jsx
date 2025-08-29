import React from 'react';
import { Stack, Icon } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

const InviteModalSummaryDuplicate = () => (
  <Stack className="duplicate-warning" direction="horizontal" gap={3}>
    <Icon className="text-info-500" src={Error} />
    <div>
      <div className="h4 mb-1">Only 1 invite per email address will be sent.</div>
      <span className="small">One or more duplicate emails were detected. Ensure that your entry is correct before proceeding.</span>
    </div>
  </Stack>
);

export default InviteModalSummaryDuplicate;

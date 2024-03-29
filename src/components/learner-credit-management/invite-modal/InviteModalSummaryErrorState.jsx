import React from 'react';
import { Stack, Icon } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

const InviteModalSummaryErrorState = () => (
  <Stack direction="horizontal" gap={3}>
    <Icon className="text-danger" src={Error} />
    <div>
      <div className="h4 mb-0">Members can&apos;t be invited as entered.</div>
      <span className="small">Please check your member emails and try again.</span>
    </div>
  </Stack>
);

export default InviteModalSummaryErrorState;

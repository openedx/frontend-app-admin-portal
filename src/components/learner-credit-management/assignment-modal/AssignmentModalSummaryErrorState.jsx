import React from 'react';
import { Stack, Icon } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

const AssignmentModalSummaryErrorState = () => (
  <Stack direction="horizontal" gap={3}>
    <Icon className="text-danger" src={Error} />
    <div>
      <div className="h4 mb-0">Learners can&apos;t be assigned as entered.</div>
      <span className="small">Please check your learner emails and try again.</span>
    </div>.
  </Stack>
);

export default AssignmentModalSummaryErrorState;

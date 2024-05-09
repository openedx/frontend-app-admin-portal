import React from 'react';
import { Stack, Icon } from '@edx/paragon';
import { Error } from '@edx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const AssignmentModalSummaryErrorState = () => (
  <Stack direction="horizontal" gap={3}>
    <Icon className="text-danger" src={Error} />
    <div>
      <div className="h4 mb-0">
        <FormattedMessage
          id="lcm.budget.detail.page.catalog.tab.assign.course.section.error.header"
          defaultMessage="Learners can{apostrophe}t be assigned as entered."
          description="Error message header when course assignment fails due to invalid learner emails."
          values={{ apostrophe: "'" }}
        />
      </div>
      <span className="small">
        <FormattedMessage
          id="lcm.budget.detail.page.catalog.tab.assign.course.section.error.message"
          defaultMessage="Please check your learner emails and try again."
          description="Error message when course assignment fails due to invalid learner emails."
        />
      </span>
    </div>.
  </Stack>
);

export default AssignmentModalSummaryErrorState;

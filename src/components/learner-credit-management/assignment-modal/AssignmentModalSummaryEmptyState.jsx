import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

const AssignmentModalSummaryEmptyState = () => (
  <>
    <div className="h4 mb-0">
      <FormattedMessage
        id="lcm.budget.detail.page.catalog.tab.course.card.entered.no.learners"
        defaultMessage="You haven{apostrophe}t entered any learners yet."
        description="Error header when no learners have been entered in the assignment modal"
        values={{ apostrophe: "'" }}
      />
    </div>
    <span className="small">
      <FormattedMessage
        id="lcm.budget.detail.page.catalog.tab.course.card.entered.no.learners.message"
        defaultMessage="Add learner emails to get started."
        description="Error Message when no learners have been entered in the assignment modal"
      />
    </span>
  </>
);

export default AssignmentModalSummaryEmptyState;

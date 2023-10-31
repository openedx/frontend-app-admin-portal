import React from 'react';
import { Collapsible } from '@edx/paragon';

export const NextStepsForAssignedLearners = () => (
  <Collapsible
    styling="basic"
    title={<h6 className="mb-0">Next steps for assigned learners</h6>}
    defaultOpen
  >
    <div className="bg-white">
      <ul className="x-small pl-4 py-2">
        <li>
          Learners will be notified of this course assignment by email.
        </li>
        <li>
          Learners must complete enrollment for this assignment by Jun 27, 2023. This deadline
          is calculated based on the course enrollment deadline or 90 days past the date of
          assignment, whichever is sooner.
        </li>
        <li>
          Learners will receive automated reminder emails every 10-15 days until the enrollment
          deadline is reached.
        </li>
      </ul>
    </div>
  </Collapsible>
);

export const ImpactOnYourLearnerCreditBudget = () => (
  <Collapsible
    styling="basic"
    title={<h6 className="mb-0">Impact on your Learner Credit budget</h6>}
  >
    <div className="bg-white">
      <ul className="x-small pl-4 py-2">
        <li>
          The total assignment cost will be earmarked as &quot;assigned&quot; funds in your
          Learner Credit budget so you can&apos;t overspend.
        </li>
        <li>
          The course cost will automatically convert from &quot;assigned&quot; to &quot;spent&quot; funds
          when your learners complete registration.
        </li>
      </ul>
    </div>
  </Collapsible>
);

export const ManagingThisAssignment = () => (
  <Collapsible
    styling="basic"
    title={<h6 className="mb-0">Managing this assignment</h6>}
  >
    <div className="bg-white">
      <ul className="x-small pl-4 py-2">
        <li>
          You will be able to monitor the status of this assignment by reviewing
          your Learner Credit Budget activity.
        </li>
        <li>
          You can cancel this course assignment or send email reminders any time
          before learners complete enrollment.
        </li>
      </ul>
    </div>
  </Collapsible>
);

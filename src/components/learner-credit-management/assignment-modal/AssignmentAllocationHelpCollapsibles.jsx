import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapsible, Stack } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import React from 'react';
import { ASSIGNMENT_ENROLLMENT_DEADLINE } from '../data';
import EVENT_NAMES from '../../../eventTracking';

const AssignmentAllocationHelpCollapsibles = ({ enterpriseId, course }) => (
  <Stack gap={1}>
    <Collapsible
      styling="basic"
      title={<h6 className="mb-0">Next steps for assigned learners</h6>}
      defaultOpen
      onToggle={(open) => {
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.TOGGLE_NEXT_STEPS,
          { isOpen: open },
        );
      }}
    >
      <div className="bg-white">
        <ul className="x-small pl-4 py-2">
          <li>
            Learners will be notified of this course assignment by email.
          </li>
          <li>
            Learners must complete enrollment for this assignment by {course.enrollmentDeadline}. This deadline
            is calculated based on the course enrollment deadline or {ASSIGNMENT_ENROLLMENT_DEADLINE} days
            past the date of assignment, whichever is sooner.
          </li>
        </ul>
      </div>
    </Collapsible>
    <Collapsible
      styling="basic"
      title={<h6 className="mb-0">Impact on your Learner Credit budget</h6>}
      onToggle={(open) => {
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.TOGGLE_IMPACT_ON_YOUR_LEARNERS,
          { isOpen: open },
        );
      }}
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
    <Collapsible
      styling="basic"
      title={<h6 className="mb-0">Managing this assignment</h6>}
      onToggle={(open) => {
        sendEnterpriseTrackEvent(
          enterpriseId,
          EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT.TOGGLE_MANAGING_THIS_ASSIGNMENT,
          { isOpen: open },
        );
      }}
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
  </Stack>
);

AssignmentAllocationHelpCollapsibles.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  course: PropTypes.shape({
    enrollmentDeadline: PropTypes.string.isRequired,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentAllocationHelpCollapsibles);

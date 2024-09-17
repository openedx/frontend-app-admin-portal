import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Collapsible, Stack } from '@openedx/paragon';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import dayjs from 'dayjs';
import { ASSIGNMENT_ENROLLMENT_DEADLINE, DATETIME_FORMAT, getNormalizedEnrollByDate } from '../data';
import EVENT_NAMES from '../../../eventTracking';

const AssignmentAllocationHelpCollapsibles = ({ enterpriseId, courseRun }) => {
  const normalizedEnrollByDate = getNormalizedEnrollByDate(courseRun);
  const enrollByDate = normalizedEnrollByDate
    ? dayjs(normalizedEnrollByDate).format(DATETIME_FORMAT)
    : null;
  return (
    <Stack gap={1}>
      <Collapsible
        styling="basic"
        title={(
          <h6 className="mb-0">
            <FormattedMessage
              id="lcm.budget.detail.page.catalog.tab.course.card.next.steps"
              defaultMessage="Next steps for assigned learners"
              description="Collapsible title for next steps for assigned learners"
            />
          </h6>
      )}
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
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.course.card.learners.will.be.notified"
                defaultMessage="Learners will be notified of this course assignment by email."
                description="A step which explains that learners will be notified of the course assignment by email"
              />
            </li>
            <li>
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.course.card.learners.must.complete.enrollment"
                defaultMessage="Learners must complete enrollment for this assignment by {courseEnrollmentDeadline}.
               This deadline is calculated based on the course enrollment deadline or {assignmentEnrollmentDeadline}
                days past the date of assignment, whichever is sooner."
                description="A step which explains that learners must complete enrollment for this assignment by a certain deadline"
                values={{
                  courseEnrollmentDeadline: enrollByDate,
                  assignmentEnrollmentDeadline: ASSIGNMENT_ENROLLMENT_DEADLINE,
                }}
              />
            </li>
          </ul>
        </div>
      </Collapsible>
      <Collapsible
        styling="basic"
        title={(
          <h6 className="mb-0">
            <FormattedMessage
              id="lcm.budget.detail.page.catalog.tab.course.card.impact.on.your.learner.credit.budget"
              defaultMessage="Impact on your Learner Credit budget"
              description="Collapsible title for impact on your learner credit budget"
            />
          </h6>
      )}
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
              <FormattedMessage
                id="lcm.budget.detailsPage.catalog.tab.course.card.total.assignment.cost"
                defaultMessage={"The total assignment cost will be earmarked as \"assigned\" funds in your Learner Credit budget so you can't overspend."}
                description="A step which explains that the total assignment cost will be earmarked as 'assigned' funds in your Learner Credit budget"
              />
            </li>
            <li>
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.course.card.course.cost.will.convert"
                defaultMessage={'The course cost will automatically convert from "assigned" to "spent" funds when your learners complete registration.'}
                description="A step which explains that the course cost will automatically convert from 'assigned' to 'spent' funds when learners complete registration"
              />
            </li>
          </ul>
        </div>
      </Collapsible>
      <Collapsible
        styling="basic"
        title={(
          <h6 className="mb-0">
            <FormattedMessage
              id="lcm.budget.detail.page.catalog.tab.course.card.managing.this.assignment"
              defaultMessage="Managing this assignment"
              description="Collapsible title for managing this assignment"
            />
          </h6>
      )}
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
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.course.card.monitor.status"
                defaultMessage="You will be able to monitor the status of this assignment by reviewing your Learner Credit Budget activity."
                description="A step which explains that you will be able to monitor the status of this assignment by reviewing your Learner Credit Budget activity"
              />
            </li>
            <li>
              <FormattedMessage
                id="lcm.budget.detail.page.catalog.tab.course.card.cancel.assignment"
                defaultMessage="You can cancel this course assignment or send email reminders any time before learners complete enrollment."
                description="A step which explains that you can cancel this course assignment or send email reminders any time before learners complete enrollment"
              />
            </li>
          </ul>
        </div>
      </Collapsible>
    </Stack>
  );
};

AssignmentAllocationHelpCollapsibles.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  courseRun: PropTypes.shape({
    enrollBy: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(AssignmentAllocationHelpCollapsibles);

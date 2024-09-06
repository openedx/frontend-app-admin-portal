import {
  Col, Icon, Row, Stack,
} from '@openedx/paragon';
import { Calendar } from '@openedx/paragon/icons';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import dayjs from 'dayjs';
import { logInfo } from '@edx/frontend-platform/logging';
import { hasCourseStarted, SHORT_MONTH_DATE_FORMAT } from '../data';

const messages = defineMessages({
  importantDates: {
    id: 'lcm.budget.detail.page.catalog.search.allocation.modal.important-dates.title',
    defaultMessage: 'Important dates',
    description: 'Title for the important dates section on the assignment modal',
  },
  enrollByDate: {
    id: 'lcm.budget.detail.page.catalog.search.allocation.modal.important-dates.enroll-by-date',
    defaultMessage: 'Enroll-by date',
    description: 'Enroll-by date for the important dates section on the assignment modal',
  },
  courseStarts: {
    id: 'lcm.budget.detail.page.catalog.search.allocation.modal.important-dates.course-starts',
    defaultMessage: 'Course starts',
    description: 'Course starts for the important dates section on the assignment modal in future tense',
  },
  courseStarted: {
    id: 'lcm.budget.detail.page.catalog.search.allocation.modal.important-dates.course-started',
    defaultMessage: 'Course started',
    description: 'Course started the important dates section on the assignment modal in past tense',
  },
});

const AssignmentModalImportantDate = ({
  label,
  children,
}) => (
  <Row className="course-important-date mx-0 py-1">
    <Col className="px-0">
      <Stack direction="horizontal" gap={2}>
        <Icon size="sm" src={Calendar} />
        {label}
      </Stack>
    </Col>
    <Col>
      {children}
    </Col>
  </Row>
);

AssignmentModalImportantDate.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const AssignmentModalImportantDates = ({ courseRun }) => {
  const intl = useIntl();
  const enrollByDate = courseRun.enrollBy ? dayjs(courseRun.enrollBy).format(SHORT_MONTH_DATE_FORMAT) : null;
  const courseStartDate = courseRun.start ? dayjs(courseRun.start).format(SHORT_MONTH_DATE_FORMAT) : null;
  const courseHasStartedLabel = hasCourseStarted(courseStartDate)
    ? intl.formatMessage(messages.courseStarted)
    : intl.formatMessage(messages.courseStarts);

  // This is an edge case that the user should never enter but covered nonetheless
  if (!enrollByDate && !courseStartDate) {
    logInfo(`[frontend-app-admin-portal][AssignmentModalImportantDates]
    Component did not render, no courseRun enrollBy date or courseStart date provided
    courseRun: ${courseRun}
    `);
    return null;
  }

  return (
    <section className="assignments-important-dates small">
      {enrollByDate && (
        <AssignmentModalImportantDate label={intl.formatMessage(messages.enrollByDate)}>
          {enrollByDate}
        </AssignmentModalImportantDate>
      )}
      {courseStartDate && (
        <AssignmentModalImportantDate label={courseHasStartedLabel}>
          {courseStartDate}
        </AssignmentModalImportantDate>
      )}
    </section>
  );
};

AssignmentModalImportantDates.propTypes = {
  courseRun: PropTypes.shape({
    enrollBy: PropTypes.number,
    start: PropTypes.string,
  }).isRequired,
};

export default AssignmentModalImportantDates;

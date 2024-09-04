import {
  Col, Icon, Row, Stack,
} from '@openedx/paragon';
import { Calendar } from '@openedx/paragon/icons';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import dayjs from 'dayjs';
import { hasCourseStarted, SHORT_MONTH_DATE_FORMAT } from '../data';

const messages = defineMessages({
  importantDates: {
    id: 'enterprise.course.about.page.important-dates.title',
    defaultMessage: 'Important dates',
    description: 'Title for the important dates section on the assignment modal',
  },
  enrollByDate: {
    id: 'enterprise.course.about.page.important-dates.enroll-by-date',
    defaultMessage: 'Enroll-by date',
    description: 'Enroll-by date for the important dates section on the assignment modal',
  },
  courseStarts: {
    id: 'enterprise.course.about.page.important-dates.course-starts',
    defaultMessage: 'Course starts',
    description: 'Course starts for the important dates section on the assignment modal in future tense',
  },
  courseStarted: {
    id: 'enterprise.course.about.page.important-dates.course-started',
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
  const enrollByDate = dayjs(courseRun.enrollBy).format(SHORT_MONTH_DATE_FORMAT) ?? null;
  const courseStartDate = dayjs(courseRun.start).format(SHORT_MONTH_DATE_FORMAT) ?? null;
  const courseHasStartedLabel = hasCourseStarted(courseStartDate)
    ? intl.formatMessage(messages.courseStarted)
    : intl.formatMessage(messages.courseStarts);

  if (!enrollByDate && !courseStartDate) {
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

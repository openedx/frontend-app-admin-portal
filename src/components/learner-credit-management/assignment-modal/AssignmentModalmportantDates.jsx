import { Icon, Stack } from '@openedx/paragon';
import { Calendar } from '@openedx/paragon/icons';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';

import dayjs from 'dayjs';
import {
  getNormalizedEnrollByDate, getNormalizedStartDate, hasCourseStarted, SHORT_MONTH_DATE_FORMAT,
} from '../data';

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
  <Stack direction="horizontal" gap={2}>
    <Icon size="sm" src={Calendar} />
    <span className="font-weight-bold">{label}:</span>
    {children}
  </Stack>
);

AssignmentModalImportantDate.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const AssignmentModalImportantDates = ({ courseRun }) => {
  const intl = useIntl();
  const normalizedEnrollByDate = getNormalizedEnrollByDate(courseRun);
  const enrollByDate = normalizedEnrollByDate
    ? dayjs(normalizedEnrollByDate).format(SHORT_MONTH_DATE_FORMAT)
    : null;
  const courseStartDate = getNormalizedStartDate(courseRun);
  const courseHasStartedLabel = hasCourseStarted(courseStartDate)
    ? intl.formatMessage(messages.courseStarted)
    : intl.formatMessage(messages.courseStarts);

  // This is an edge case that the user should never enter but covered nonetheless
  if (!enrollByDate && !courseStartDate) {
    return null;
  }

  return (
    <section className="assignments-important-dates small">
      <Stack direction="vertical" gap={1}>
        {enrollByDate && (
        <AssignmentModalImportantDate label={intl.formatMessage(messages.enrollByDate)}>
          {enrollByDate}
        </AssignmentModalImportantDate>
        )}
        {courseStartDate && (
        <AssignmentModalImportantDate label={courseHasStartedLabel}>
          {dayjs(courseStartDate).format(SHORT_MONTH_DATE_FORMAT)}
        </AssignmentModalImportantDate>
        )}
      </Stack>
    </section>
  );
};

AssignmentModalImportantDates.propTypes = {
  courseRun: PropTypes.shape({
    enrollBy: PropTypes.string,
    start: PropTypes.string,
  }).isRequired,
};

export default AssignmentModalImportantDates;

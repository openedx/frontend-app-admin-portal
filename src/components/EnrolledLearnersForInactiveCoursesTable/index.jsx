import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import TableContainer from '../../containers/TableContainer';
import { i18nFormatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrolledLearnersForInactiveCoursesTable = () => {
  const intl = useIntl();

  const tableColumns = [
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the enrolled learners table for inactive courses',
      }),
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.enrollment_count.column.heading',
        defaultMessage: 'Total Course Enrollment Count',
        description: 'Column heading for the course enrollment count column in the enrolled learners table for inactive courses',
      }),
      key: 'enrollment_count',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.course_completion_count.column.heading',
        defaultMessage: 'Total Completed Courses Count',
        description: 'Column heading for the completed courses count column in the enrolled learners table for inactive courses',
      }),
      key: 'course_completion_count',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.last_activity_date.column.heading',
        defaultMessage: 'Last Activity Date',
        description: 'Column heading for the last activity date column in the enrolled learners table for inactive courses',
      }),
      key: 'last_activity_date',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_email: <span data-hj-suppress>{learner.user_email}</span>,
    last_activity_date: i18nFormatTimestamp({
      intl, timestamp: learner.last_activity_date,
    }),
  }));

  return (
    <TableContainer
      id="enrolled-learners-inactive-courses"
      className="enrolled-learners-inactive-courses"
      fetchMethod={EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses}
      columns={tableColumns}
      formatData={formatLearnerData}
      tableSortable
    />
  );
};

export default EnrolledLearnersForInactiveCoursesTable;

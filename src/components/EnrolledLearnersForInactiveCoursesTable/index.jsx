import React from 'react';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

function EnrolledLearnersForInactiveCoursesTable() {
  const tableColumns = [
    {
      label: 'Email',
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: 'Total Course Enrollment Count',
      key: 'enrollment_count',
      columnSortable: true,
    },
    {
      label: 'Total Completed Courses Count',
      key: 'course_completion_count',
      columnSortable: true,
    },
    {
      label: 'Last Activity Date',
      key: 'last_activity_date',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_email: <span data-hj-suppress>{learner.user_email}</span>,
    last_activity_date: formatTimestamp({
      timestamp: learner.last_activity_date,
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
}

export default EnrolledLearnersForInactiveCoursesTable;

import React from 'react';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrolledLearnersForInactiveCoursesTable = () => {
  const tableColumns = [
    {
      Header: 'Email',
      accessor: 'user_email',
      columnSortable: true,
    },
    {
      Header: 'Total Course Enrollment Count',
      accessor: 'enrollment_count',
      columnSortable: true,
    },
    {
      Header: 'Total Completed Courses Count',
      accessor: 'course_completion_count',
      columnSortable: true,
    },
    {
      Header: 'Last Activity Date',
      accessor: 'last_activity_date',
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
};

export default EnrolledLearnersForInactiveCoursesTable;

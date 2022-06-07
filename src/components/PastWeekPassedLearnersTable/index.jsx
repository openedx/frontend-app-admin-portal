import React from 'react';

import TableContainer from '../../containers/TableContainer';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { formatTimestamp } from '../../utils';

const PastWeekPassedLearnersTable = () => {
  const tableColumns = [
    {
      Header: 'Email',
      accessor: 'user_email',
      columnSortable: true,
    },
    {
      Header: 'Course Title',
      accessor: 'course_title',
      columnSortable: true,
    },
    {
      Header: 'Passed Date',
      accessor: 'passed_date',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_email: <span data-hj-suppress>{learner.user_email}</span>,
    passed_date: formatTimestamp({ timestamp: learner.passed_date }),
  }));

  return (
    <TableContainer
      id="completed-learners-week"
      className="completed-learners-week"
      fetchMethod={(enterpriseId, options) => EnterpriseDataApiService.fetchCourseEnrollments(
        enterpriseId,
        {
          passed_date: 'last_week',
          ...options,
        },
      )}
      columns={tableColumns}
      formatData={formatLearnerData}
      tableSortable
    />
  );
};

export default PastWeekPassedLearnersTable;

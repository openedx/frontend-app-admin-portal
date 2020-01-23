import React from 'react';

import TableContainer from '../../containers/TableContainer';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { formatTimestamp } from '../../utils';

const PastWeekPassedLearnersTable = () => {
  const tableColumns = [
    {
      label: 'Email',
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: 'Course Title',
      key: 'course_title',
      columnSortable: true,
    },
    {
      label: 'Passed Date',
      key: 'passed_timestamp',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    passed_timestamp: formatTimestamp({ timestamp: learner.passed_timestamp }),
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

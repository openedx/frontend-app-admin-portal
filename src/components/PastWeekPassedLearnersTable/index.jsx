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

  const options = { passed_date: 'last_week' };

  return (
    <TableContainer
      id="past-week-passed-learners"
      className="past-week-passed-learners"
      fetchMethod={() => EnterpriseDataApiService.fetchCourseEnrollments(options)}
      columns={tableColumns}
      formatData={formatLearnerData}
    />
  );
};

export default PastWeekPassedLearnersTable;

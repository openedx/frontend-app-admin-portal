import React from 'react';

import TableContainer from '../../containers/TableContainer';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const CompletedLearnersTable = () => {
  const tableColumns = [
    {
      label: 'Email',
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: 'Total Course Completed Count',
      key: 'completed_courses',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners;

  return (
    <TableContainer
      id="completed-learners"
      className="completed-learners"
      fetchMethod={EnterpriseDataApiService.fetchCompletedLearners}
      columns={tableColumns}
      formatData={formatLearnerData}
      tableSortable
    />
  );
};

export default CompletedLearnersTable;

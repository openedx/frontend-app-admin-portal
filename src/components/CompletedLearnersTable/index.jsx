import React from 'react';

import TableContainer from '../../containers/TableContainer';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const CompletedLearnersTable = () => {
  const tableColumns = [
    {
      Header: 'Email',
      accessor: 'user_email',
      columnSortable: true,
    },
    {
      Header: 'Total Course Completed Count',
      accessor: 'completed_courses',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_email: <span data-hj-suppress>{learner.user_email}</span>,
  }));

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

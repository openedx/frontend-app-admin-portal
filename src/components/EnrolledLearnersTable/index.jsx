import React from 'react';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrolledLearnersTable = () => {
  const tableColumns = [
    {
      label: 'Email',
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: 'Account Created',
      key: 'user_account_creation_timestamp',
      columnSortable: true,
    },
    {
      label: 'Total Course Enrollment Count',
      key: 'enrollment_count',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_account_creation_timestamp: formatTimestamp({
      timestamp: learner.user_account_creation_timestamp,
    }),
  }));

  return (
    <TableContainer
      id="enrolled-learners"
      className="enrolled-learners"
      fetchMethod={EnterpriseDataApiService.fetchEnrolledLearners}
      columns={tableColumns}
      formatData={formatLearnerData}
      tableSortable
    />
  );
};

export default EnrolledLearnersTable;

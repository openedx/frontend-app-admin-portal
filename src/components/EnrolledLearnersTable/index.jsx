import React from 'react';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrolledLearnersTable = () => {
  const tableColumns = [
    {
      label: 'Email',
      key: 'user_email',
    },
    {
      label: 'Account Created',
      key: 'user_account_creation_timestamp',
    },
    {
      label: 'Total Course Enrollment Count',
      key: 'enrollment_count',
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
    />
  );
};

export default EnrolledLearnersTable;

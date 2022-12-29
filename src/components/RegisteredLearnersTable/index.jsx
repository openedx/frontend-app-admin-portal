import React from 'react';

import TableContainer from '../../containers/TableContainer';

import { formatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const RegisteredLearnersTable = () => {
  const tableColumns = [
    {
      label: 'Email',
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: 'Account Created',
      key: 'lms_user_created',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_email: <span data-hj-suppress>{learner.user_email}</span>,
    lms_user_created: formatTimestamp({
      timestamp: learner.lms_user_created,
    }),
  }));

  return (
    <TableContainer
      id="registered-unenrolled-learners"
      className="registered-unenrolled-learners"
      fetchMethod={EnterpriseDataApiService.fetchUnenrolledRegisteredLearners}
      columns={tableColumns}
      formatData={formatLearnerData}
      tableSortable
    />
  );
};

export default RegisteredLearnersTable;

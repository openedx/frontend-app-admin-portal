import React from 'react';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrolledLearnersTable = () => {
  const tableColumns = [
    {
      Header: 'Email',
      accessor: 'user_email',
      columnSortable: true,
    },
    {
      Header: 'Account Created',
      accessor: 'lms_user_created',
      columnSortable: true,
    },
    {
      Header: 'Total Course Enrollment Count',
      accessor: 'enrollment_count',
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

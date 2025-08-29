import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import TableContainer from '../../containers/TableContainer';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const CompletedLearnersTable = () => {
  const intl = useIntl();

  const tableColumns = [
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.completed.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the completed learners table',
      }),
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.completed.learned.table.completed_courses.column.heading',
        defaultMessage: 'Total Course Completed Count',
        description: 'Column heading for the completed courses column in the completed learners table',
      }),
      key: 'completed_courses',
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

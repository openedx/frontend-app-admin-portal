import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import TableContainer from '../../containers/TableContainer';

import { i18nFormatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const RegisteredLearnersTable = () => {
  const intl = useIntl();

  const tableColumns = [
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.registered.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the registered learners table',
      }),
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.registered.learners.table.lms_user_created.column.heading',
        defaultMessage: 'Account Created',
        description: 'Column heading for the lms user created column in the registered learners table',
      }),
      key: 'lms_user_created',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_email: <span data-hj-suppress>{learner.user_email}</span>,
    lms_user_created: i18nFormatTimestamp({
      intl, timestamp: learner.lms_user_created,
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

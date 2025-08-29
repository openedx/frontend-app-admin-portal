import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import TableContainer from '../../containers/TableContainer';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { i18nFormatTimestamp } from '../../utils';

const PastWeekPassedLearnersTable = () => {
  const intl = useIntl();

  const tableColumns = [
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.past.week.passed.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the past week passed learners table',
      }),
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.past.week.passed.learners.table.course_title.column.heading',
        defaultMessage: 'Course Title',
        description: 'Column heading for the course title column in the past week passed learners table',
      }),
      key: 'course_title',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'admin.portal.lpr.past.week.passed.learners.table.passed_date.column.heading',
        defaultMessage: 'Passed Date',
        description: 'Column heading for the passed date column in the past week passed learners table',
      }),
      key: 'passed_date',
      columnSortable: true,
    },
  ];

  const formatLearnerData = learners => learners.map(learner => ({
    ...learner,
    user_email: <span data-hj-suppress>{learner.user_email}</span>,
    passed_date: i18nFormatTimestamp({ intl, timestamp: learner.passed_date }),
  }));

  return (
    <TableContainer
      id="completed-learners-week"
      className="completed-learners-week"
      fetchMethod={(enterpriseId, options) => EnterpriseDataApiService.fetchCourseEnrollments(
        enterpriseId,
        {
          passedDate: 'last_week',
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

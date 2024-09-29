import React, { useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable } from '@openedx/paragon';
import { useGenericTableData } from './data/hooks';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import EmailCell from './EmailCell';

const CompletedLearnersTable = (enterpriseId) => {
  const intl = useIntl();
  const {
    isLoading,
    tableData,
    fetchTableData,
  } = useGenericTableData(
    enterpriseId,
    'completed-learners',
    EnterpriseDataApiService.fetchCompletedLearners,
    useMemo(() => ({
      userEmail: { key: 'user_email' },
      completedCourses: { key: 'completed_courses' },
    }), []),
  );

  return (
    <DataTable
      isSortable
      manualSortBy
      isPaginated
      manualPagination
      isLoading={isLoading}
      columns={[
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.completed.learners.table.user_email.column.heading',
            defaultMessage: 'Email',
            description: 'Column heading for the user email column in the completed learners table',
          }),
          accessor: 'userEmail',
          Cell: EmailCell,
        },
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.completed.learners.table.completed_courses.column.heading',
            defaultMessage: 'Total Course Completed Count',
            description: 'Column heading for the completed courses column in the completed learners table',
          }),
          accessor: 'completedCourses',
        },
      ]}
      initialState={{
        pageIndex: 20,
        pageSize: 0,
        sortBy: [{ id: 'completedCourses', desc: true }],
        selectedRowsOrdered: [],
      }}
      fetchData={fetchTableData}
      data={tableData.results}
      itemCount={tableData.itemCount}
      pageCount={tableData.pageCount}
    />
  );
};

export default CompletedLearnersTable;

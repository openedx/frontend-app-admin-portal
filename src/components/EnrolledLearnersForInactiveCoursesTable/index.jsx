import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from '@edx/frontend-platform/i18n';

import { DataTable } from '@openedx/paragon';
import { i18nFormatTimestamp } from '../../utils';
import useEnrolledLearnersForInactiveCourses from './data/hooks/useEnrolledLearnersForInactiveCourses';

const UserEmail = ({ row }) => (
  <span data-hj-suppress>{row.original.userEmail}</span>
);

UserEmail.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      userEmail: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

const EnrolledLearnersForInactiveCoursesTable = (enterpriseId) => {
  const intl = useIntl();
  const {
    isLoading,
    enrolledLearnersForInactiveCourses: tableData,
    fetchEnrolledLearnersForInactiveCourses: fetchTableData,
  } = useEnrolledLearnersForInactiveCourses(enterpriseId);

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
            id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.user_email.column.heading',
            defaultMessage: 'Email',
          }),
          accessor: 'userEmail',
          Cell: UserEmail,
        },
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.enrollment_count.column.heading',
            defaultMessage: 'Total Course Enrollment Count',
          }),
          accessor: 'enrollmentCount',
        },
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.course_completion_count.column.heading',
            defaultMessage: 'Total Completed Courses Count',
          }),
          accessor: 'courseCompletionCount',
        },
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.last_activity_date.column.heading',
            defaultMessage: 'Last Activity Date',
          }),
          accessor: 'lastActivityDate',
          Cell: ({ cell: { value } }) => i18nFormatTimestamp({ intl, timestamp: value }),
        },
      ]}
      initialState={{
        pageIndex: 20,
        pageSize: 0,
        sortBy: [{ id: 'lastActivityDate', desc: true }],
        selectedRowsOrdered: [],
      }}
      fetchData={fetchTableData}
      data={tableData.results}
      itemCount={tableData.itemCount}
      pageCount={tableData.pageCount}
    />
  );
};

export default EnrolledLearnersForInactiveCoursesTable;

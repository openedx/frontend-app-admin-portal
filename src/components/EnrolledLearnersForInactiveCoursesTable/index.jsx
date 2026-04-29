import React, {
  useCallback, useState,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { i18nFormatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const UserEmailCell = ({ row }) => (
  <span data-hj-suppress>{row.original.user_email}</span>
);

UserEmailCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      user_email: PropTypes.string,
    }),
  }).isRequired,
};

const EnrolledLearnersForInactiveCoursesTable = ({ enterpriseId }) => {
  const intl = useIntl();

  const [tableData, setTableData] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the enrolled learners table for inactive courses',
      }),
      accessor: 'user_email',
      Cell: UserEmailCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.enrollment_count.column.heading',
        defaultMessage: 'Total Course Enrollment Count',
        description: 'Column heading for the course enrollment count column in the enrolled learners table for inactive courses',
      }),
      accessor: 'enrollment_count',
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.course_completion_count.column.heading',
        defaultMessage: 'Total Completed Courses Count',
        description: 'Column heading for the completed courses count column in the enrolled learners table for inactive courses',
      }),
      accessor: 'course_completion_count',
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.last_activity_date.column.heading',
        defaultMessage: 'Last Activity Date',
        description: 'Column heading for the last activity date column in the enrolled learners table for inactive courses',
      }),
      accessor: 'last_activity_date',
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: ({ row }) => i18nFormatTimestamp({
        intl,
        timestamp: row.original.last_activity_date,
      }),
    },
  ];

  const fetchData = useCallback(
    async (args) => {
      setIsLoading(true);
      const options = {
        page: args.pageIndex + 1,
        page_size: args.pageSize,
      };

      const sortBy = args.sortBy?.[0];
      if (sortBy) {
        options.ordering = sortBy.desc ? `-${sortBy.id}` : sortBy.id;
      }

      try {
        const response = await EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses(
          enterpriseId,
          options,
        );
        const { data } = response;
        setTableData(data.results || []);
        setItemCount(data.count || 0);
        setPageCount(data.num_pages || 0);
      } finally {
        setIsLoading(false);
      }
    },
    [enterpriseId],
  );

  return (
    <DataTable
      className="enrolled-learners-inactive-courses"
      isLoading={isLoading}
      isPaginated
      manualPagination
      isSortable
      manualSortBy
      initialState={{
        pageSize: 50,
        pageIndex: 0,
      }}
      initialTableOptions={{
        getRowId: row => `${row.user_email}`,
      }}
      itemCount={itemCount}
      pageCount={pageCount}
      fetchData={fetchData}
      data={tableData}
      columns={columns}
    >
      <DataTable.TableControlBar />
      <DataTable.Table />
      <DataTable.EmptyTable
        content={intl.formatMessage({
          id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.empty',
          defaultMessage: 'No results found.',
          description: 'Empty state message for the enrolled learners for inactive courses table',
        })}
      />
      <DataTable.TableFooter />
    </DataTable>
  );
};

EnrolledLearnersForInactiveCoursesTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnrolledLearnersForInactiveCoursesTable);

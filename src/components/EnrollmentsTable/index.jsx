import React, {
  useCallback, useState,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  i18nFormatTimestamp, i18nFormatPassedTimestamp, i18nFormatProgressStatus, formatPercentage,
} from '../../utils';
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

const EnrollmentsTable = ({ enterpriseId }) => {
  const intl = useIntl();

  const [tableData, setTableData] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getEmptyMessage = () => {
    const query = new URLSearchParams(window.location.search);
    if (query.has('group_uuid')) {
      return intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.empty.groups.message',
        defaultMessage: 'We are currently processing the latest updates. The data is refreshed twice a day. Thank you for your patience, and please check back soon.',
        description: 'Empty table message when groups data is pending.',
      });
    }
    return intl.formatMessage({
      id: 'admin.portal.lpr.enrollments.table.empty',
      defaultMessage: 'There are no results.',
      description: 'Empty state message for the enrollments table',
    });
  };

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.user_email',
        defaultMessage: 'Email',
      }),
      accessor: 'user_email',
      Cell: UserEmailCell,
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.user_first_name',
        defaultMessage: 'First Name',
        description: 'Title for the first name column in the enrollments table',
      }),
      accessor: 'user_first_name',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.user_last_name',
        defaultMessage: 'Last Name',
        description: 'Title for the last name column in the enrollments table',
      }),
      accessor: 'user_last_name',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseTitle',
        defaultMessage: 'Course Title',
      }),
      accessor: 'course_title',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseListPrice',
        defaultMessage: 'Course Price',
      }),
      accessor: 'course_list_price',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseStartDate',
        defaultMessage: 'Start Date',
      }),
      accessor: 'course_start_date',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseEndDate',
        defaultMessage: 'End Date',
      }),
      accessor: 'course_end_date',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.passedDate',
        defaultMessage: 'Passed Date',
      }),
      accessor: 'passed_date',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.currentGrade',
        defaultMessage: 'Current Grade',
      }),
      accessor: 'current_grade',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.progressStatus',
        defaultMessage: 'Progress Status',
      }),
      accessor: 'progress_status',
    },
    {
      Header: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.lastActivityDate',
        defaultMessage: 'Last Activity Date',
      }),
      accessor: 'last_activity_date',
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

      // Preserve group_uuid filter from URL query params
      const query = new URLSearchParams(window.location.search);
      if (query.has('group_uuid')) {
        options.group_uuid = query.get('group_uuid');
      }

      try {
        const response = await EnterpriseDataApiService.fetchCourseEnrollments(
          enterpriseId,
          options,
        );
        const { data } = response;

        const formatted = (data.results || []).map(enrollment => ({
          ...enrollment,
          last_activity_date: i18nFormatTimestamp({ intl, timestamp: enrollment.last_activity_date }),
          course_start_date: i18nFormatTimestamp({ intl, timestamp: enrollment.course_start_date }),
          course_end_date: i18nFormatTimestamp({ intl, timestamp: enrollment.course_end_date }),
          enrollment_date: i18nFormatTimestamp({ intl, timestamp: enrollment.enrollment_date }),
          passed_date: i18nFormatPassedTimestamp({ intl, timestamp: enrollment.passed_date }),
          user_account_creation_date: i18nFormatTimestamp({
            intl, timestamp: enrollment.user_account_creation_date,
          }),
          progress_status: i18nFormatProgressStatus({
            intl, progressStatus: enrollment.progress_status,
          }),
          course_list_price: enrollment.course_list_price ? `$${enrollment.course_list_price}` : '',
          current_grade: formatPercentage({ decimal: enrollment.current_grade }),
        }));

        setTableData(formatted);
        setItemCount(data.count || 0);
        setPageCount(data.num_pages || 0);
      } finally {
        setIsLoading(false);
      }
    },
    [enterpriseId, intl],
  );

  return (
    <DataTable
      className="enrollments"
      isLoading={isLoading}
      isPaginated
      manualPagination
      isSortable
      manualSortBy
      initialState={{
        pageSize: 50,
        pageIndex: 0,
        sortBy: [{ id: 'current_grade', desc: true }],
      }}
      initialTableOptions={{
        getRowId: row => `${row.user_email}-${row.course_title}`,
      }}
      itemCount={itemCount}
      pageCount={pageCount}
      fetchData={fetchData}
      data={tableData}
      columns={columns}
    >
      <DataTable.TableControlBar />
      <DataTable.Table />
      <DataTable.EmptyTable content={getEmptyMessage()} />
      <DataTable.TableFooter />
    </DataTable>
  );
};

EnrollmentsTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnrollmentsTable);

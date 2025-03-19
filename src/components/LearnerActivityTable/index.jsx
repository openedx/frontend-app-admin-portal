import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable, TextFilter, TableFooter } from '@openedx/paragon';
import { connect } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_PAGE, PAGE_SIZE } from '../../data/constants/table';
import {
  i18nFormatTimestamp,
  i18nFormatPassedTimestamp,
  i18nFormatProgressStatus,
  formatPercentage,
} from '../../utils';
import { formatPrice } from '../learner-credit-management/data';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import useDataTable from '../../hooks/useDataTable';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

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

const LearnerActivityTable = ({ id, enterpriseId, activity }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse the current page from URL query parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Get page from URL (one-based) and convert to zero-based for the table
  const currentPageFromUrl = (parseInt(queryParams.get('page'), 10) || 1) - 1;

  // Define the field mappings as a memoized object to prevent recreation
  const fieldMappings = useMemo(() => ({
    userEmail: { key: 'user_email' },
    courseTitle: { key: 'course_title' },
    courseListPrice: { key: 'course_list_price' },
    courseStartDate: { key: 'course_start_date' },
    courseEndDate: { key: 'course_end_date' },
    passedDate: { key: 'passed_date' },
    currentGrade: { key: 'current_grade' },
    progressStatus: { key: 'progress_status' },
    lastActivityDate: { key: 'last_activity_date' },
  }), []); // Empty dependency array means this object is created once

  // Create a stable fetch function that depends only on enterpriseId
  const fetchEnrollments = useCallback(
    (options) => EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, options),
    [enterpriseId],
  );

  // Use the generic hook
  const {
    isLoading,
    tableData: courseEnrollments,
    fetchData: fetchDataOriginal,
  } = useDataTable(fetchEnrollments, fieldMappings);

  // Wrap the fetchData function to also update URL
  const fetchCourseEnrollments = useCallback((tableState) => {
    const newPage = tableState.pageIndex;

    // Update URL with new page number
    const newQueryParams = new URLSearchParams(location.search);
    if (newPage !== DEFAULT_PAGE) {
      newQueryParams.set('page', newPage + 1); // Add 1 to convert to one-based for URL
    } else {
      newQueryParams.delete('page');
    }

    const newSearch = newQueryParams.toString();
    const queryString = newSearch ? `?${newSearch}` : '';
    const newUrl = `${location.pathname}${queryString}`;

    navigate(newUrl, { replace: true });

    // Call original fetch function
    return fetchDataOriginal(tableState);
  }, [fetchDataOriginal, location.pathname, location.search, navigate]);

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the learner activity table',
      }),
      accessor: 'userEmail',
      Cell: UserEmail,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_title.column.heading',
        defaultMessage: 'Course Title',
        description: 'Column heading for the course title column in the learner activity table',
      }),
      accessor: 'courseTitle',
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_list_price.column.heading',
        defaultMessage: 'Course Price',
        description: 'Column heading for the course price column in the learner activity table',
      }),
      accessor: 'courseListPrice',
      Cell: ({ row }) => formatPrice(row.values.courseListPrice),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_start_date.column.heading',
        defaultMessage: 'Start Date',
        description: 'Column heading for the course start date column in the learner activity table',
      }),
      accessor: 'courseStartDate',
      Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.courseStartDate }),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.course_end_date.column.heading',
        defaultMessage: 'End Date',
        description: 'Column heading for the course end date column in the learner activity table',
      }),
      accessor: 'courseEndDate',
      Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.courseEndDate }),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.passed_date.column.heading',
        defaultMessage: 'Passed Date',
        description: 'Column heading for the passed date column in the learner activity table',
      }),
      accessor: 'passedDate',
      Cell: ({ row }) => i18nFormatPassedTimestamp({ intl, timestamp: row.values.passedDate }),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.current_grade.column.heading',
        defaultMessage: 'Current Grade',
        description: 'Column heading for the current grade column in the learner activity table',
      }),
      accessor: 'currentGrade',
      Cell: ({ row }) => formatPercentage({ decimal: row.values.currentGrade }),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.progress_status.column.heading',
        defaultMessage: 'Progress Status',
        description: 'Column heading for the progress status column in the learner activity table',
      }),
      accessor: 'progressStatus',
      Cell: ({ row }) => i18nFormatProgressStatus({ intl, progressStatus: row.values.progressStatus }),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.learner.activity.table.enrollment_date.column.heading',
        defaultMessage: 'Last Activity Date',
        description: 'Column heading for the last activity date column in the learner activity table',
      }),
      accessor: 'lastActivityDate',
      Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.lastActivityDate }),
    },
  ];

  if (activity !== 'active_past_week') {
    columns.splice(columns.findIndex(col => col.accessor === 'passedDate'), 1);
  }

  return (
    <div>
      <DataTable
        id={id}
        isSortable
        manualSortBy
        isPaginated
        manualPagination
        isLoading={isLoading}
        FilterStatusComponent={FilterStatus}
        defaultColumnValues={{ Filter: TextFilter }}
        columns={columns}
        initialState={{
          pageIndex: currentPageFromUrl,
          pageSize: PAGE_SIZE,
          sortBy: [{ id: 'lastActivityDate', desc: true }],
          selectedRowsOrdered: [],
        }}
        fetchData={fetchCourseEnrollments}
        data={courseEnrollments.results}
        itemCount={courseEnrollments.itemCount}
        pageCount={courseEnrollments.pageCount}
      />
      <TableFooter />
    </div>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

LearnerActivityTable.propTypes = {
  id: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  activity: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(LearnerActivityTable);

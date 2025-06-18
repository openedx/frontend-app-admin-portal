/* eslint-disable react-hooks/exhaustive-deps */
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable, TextFilter } from '@openedx/paragon';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useCallback, useEffect } from 'react';
import useCourseEnrollments from './data/hooks/useCourseEnrollments';
import { PAGE_SIZE } from '../../data/constants/table';
import {
  i18nFormatTimestamp,
  i18nFormatPassedTimestamp,
  i18nFormatProgressStatus,
  formatPercentage,
  updateUrlWithPageNumber,
} from '../../utils';
import { formatPrice } from '../learner-credit-management/data';
import { useTableData } from '../Admin/TableDataContext';

const FilterStatus = (rest) => <DataTable.FilterStatus showFilteredFields={false} {...rest} />;

const UserEmail = ({ row }) => (
  <span data-hj-suppress>{row.original.userEmail}</span>
);

UserEmail.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      userEmail: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

const LearnerActivityTable = ({ id, enterpriseId, activity }) => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { setTableHasData } = useTableData();

  // Parse the current page from URL query parameters - adjust for zero-based indexing
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const pageFromUrl = parseInt(queryParams.get(`${id}-page`), 10) || 1; // Default to page 1 in URL
  const currentPageFromUrl = pageFromUrl - 1; // Convert to zero-based for DataTable

  const apiFieldsForColumnAccessor = useMemo(() => ({
    userEmail: { key: 'user_email' },
    courseTitle: { key: 'course_title' },
    courseListPrice: { key: 'course_list_price' },
    courseStartDate: { key: 'course_start_date' },
    courseEndDate: { key: 'course_end_date' },
    passedDate: { key: 'passed_date' },
    currentGrade: { key: 'current_grade' },
    progressStatus: { key: 'progress_status' },
    lastActivityDate: { key: 'last_activity_date' },
  }), []);

  const {
    isLoading,
    data: courseEnrollments,
    fetchData: fetchCourseEnrollments,
    fetchDataImmediate,
    hasData,
  } = useCourseEnrollments(enterpriseId, id, apiFieldsForColumnAccessor);

  /// To load data correctly the first time, we use the non-debounced `fetchDataImmediate`
  // on initial load to ensure the data is fetched immediately without any delay.
  useEffect(() => {
    fetchDataImmediate({
      pageIndex: currentPageFromUrl,
      pageSize: PAGE_SIZE,
      sortBy: [],
    }, true);
  }, []);

  // Update context when data status changes
  useEffect(() => {
    setTableHasData(id, hasData);
  }, [id, hasData]);

  // Wrap fetchCourseEnrollments to update the URL when pagination changes
  const fetchTableData = useCallback((tableState) => {
    const newPageForUrl = tableState.pageIndex + 1; // Convert zero-based index to one-based for URL
    updateUrlWithPageNumber(id, newPageForUrl, location, navigate);

    return fetchCourseEnrollments(tableState);
  }, [fetchCourseEnrollments]);

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
      initialTableOptions={{
        autoResetPage: true,
      }}
      initialState={{
        pageIndex: currentPageFromUrl, // Use page from URL
        pageSize: PAGE_SIZE,
        sortBy: [{ id: 'lastActivityDate', desc: true }],
        selectedRowsOrdered: [],
      }}
      fetchData={fetchTableData}
      data={courseEnrollments.results}
      itemCount={courseEnrollments.itemCount}
      pageCount={courseEnrollments.pageCount}
    />
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

/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable, TextFilter } from '@openedx/paragon';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import useCourseUsers from './data/hooks/useCourseUsers';
import { PAGE_SIZE } from '../../data/constants/table';
import { i18nFormatTimestamp, updateUrlWithPageNumber } from '../../utils';
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

const EnrolledLearnersForInactiveCoursesTable = ({ id, enterpriseId }) => {
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
    enrollmentCount: { key: 'enrollment_count' },
    courseCompletionCount: { key: 'course_completion_count' },
    lastActivityDate: { key: 'last_activity_date' },
  }), []);

  const {
    isLoading,
    data: courseUsers,
    fetchData: fetchCourseUsers,
    fetchDataImmediate,
    hasData,
  } = useCourseUsers(enterpriseId, id, apiFieldsForColumnAccessor);

  // To load data correctly the first time, we use the non-debounced `fetchDataImmediate`
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

  // Wrap fetchCourseUsers to update the URL when pagination changes
  const fetchTableData = useCallback((tableState) => {
    const newPageForUrl = tableState.pageIndex + 1; // Convert zero-based index to one-based for URL
    updateUrlWithPageNumber(id, newPageForUrl, location, navigate);

    return fetchCourseUsers(tableState);
  }, [fetchCourseUsers]);

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the enrolled learners table for inactive courses',
      }),
      accessor: 'userEmail',
      Cell: UserEmail,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.enrollment_count.column.heading',
        defaultMessage: 'Total Course Enrollment Count',
        description: 'Column heading for the course enrollment count column in the enrolled learners table for inactive courses',
      }),
      accessor: 'enrollmentCount',
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.course_completion_count.column.heading',
        defaultMessage: 'Total Completed Courses Count',
        description: 'Column heading for the completed courses count column in the enrolled learners table for inactive courses',
      }),
      accessor: 'courseCompletionCount',
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.inactive.courses.table.last_activity_date.column.heading',
        defaultMessage: 'Last Activity Date',
        description: 'Column heading for the last activity date column in the enrolled learners table for inactive courses',
      }),
      accessor: 'lastActivityDate',
      Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.lastActivityDate }),
    },
  ];

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
      initialState={{
        pageIndex: currentPageFromUrl, // Use page from URL
        pageSize: PAGE_SIZE,
        sortBy: [{ id: 'lastActivityDate', desc: true }],
        selectedRowsOrdered: [],
      }}
      fetchData={fetchTableData}
      data={courseUsers.results}
      itemCount={courseUsers.itemCount}
      pageCount={courseUsers.pageCount}
    />
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

EnrolledLearnersForInactiveCoursesTable.propTypes = {
  id: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(EnrolledLearnersForInactiveCoursesTable);

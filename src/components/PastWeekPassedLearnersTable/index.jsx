/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable, TextFilter } from '@openedx/paragon';
import { connect } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { i18nFormatTimestamp, updateUrlWithPageNumber } from '../../utils';
import usePastWeekPassedLearners from './data/hooks/usePastWeekPassedLearners';
import { PAGE_SIZE } from '../../data/constants/table';
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

const PastWeekPassedLearnersTable = ({ id, enterpriseId }) => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const { setTableHasData } = useTableData();

  // Parse the current page from URL query parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const pageFromUrl = parseInt(queryParams.get(`${id}-page`), 10) || 1; // Default to page 1 in URL
  const currentPageFromUrl = pageFromUrl - 1; // Convert to zero-based for DataTable

  const apiFieldsForColumnAccessor = useMemo(() => ({
    userEmail: { key: 'user_email' },
    courseTitle: { key: 'course_title' },
    passedDate: { key: 'passed_date' },
  }), []);

  const {
    isLoading,
    data: pastWeekPassedLearners,
    fetchData: fetchLearnersData,
    fetchDataImmediate,
    hasData,
  } = usePastWeekPassedLearners(enterpriseId, id, apiFieldsForColumnAccessor);

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.past.week.passed.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the past week passed learners table',
      }),
      accessor: 'userEmail',
      Cell: UserEmail,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.past.week.passed.learners.table.course_title.column.heading',
        defaultMessage: 'Course Title',
        description: 'Column heading for the course title column in the past week passed learners table',
      }),
      accessor: 'courseTitle',
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.past.week.passed.learners.table.passed_date.column.heading',
        defaultMessage: 'Passed Date',
        description: 'Column heading for the passed date column in the past week passed learners table',
      }),
      accessor: 'passedDate',
      Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.passedDate }),
    },
  ];

  useEffect(() => {
    fetchDataImmediate({
      pageIndex: currentPageFromUrl,
      pageSize: PAGE_SIZE,
      sortBy: [
        { id: 'passedDate', desc: true },
      ],
    }, true);
  }, []);

  // Update context when data status changes
  useEffect(() => {
    setTableHasData(id, hasData);
  }, [id, hasData]);

  const fetchTableData = useCallback((tableState) => {
    const newPageForUrl = tableState.pageIndex + 1; // Convert zero-based index to one-based for URL
    updateUrlWithPageNumber(id, newPageForUrl, location, navigate);

    return fetchLearnersData(tableState);
  }, [fetchLearnersData]);

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
        pageIndex: currentPageFromUrl,
        pageSize: PAGE_SIZE,
        sortBy: [{ id: 'passedDate', desc: true }],
      }}
      fetchData={fetchTableData}
      data={pastWeekPassedLearners.results}
      itemCount={pastWeekPassedLearners.itemCount}
      pageCount={pastWeekPassedLearners.pageCount}
    />
  );
};

PastWeekPassedLearnersTable.propTypes = {
  id: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(PastWeekPassedLearnersTable);

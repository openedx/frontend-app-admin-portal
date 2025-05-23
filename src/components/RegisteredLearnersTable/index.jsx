/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable, TextFilter } from '@openedx/paragon';
import { useLocation, useNavigate } from 'react-router-dom';

import { i18nFormatTimestamp, updateUrlWithPageNumber } from '../../utils';
import { PAGE_SIZE } from '../../data/constants/table';
import { useTableData } from '../Admin/TableDataContext';
import useRegisteredLearners from './data/hooks/useRegisteredLearners';

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

const RegisteredLearnersTable = ({ id, enterpriseId }) => {
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
    lmsUserCreated: { key: 'lms_user_created' },
  }), []);

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.registered.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the registered learners table',
      }),
      accessor: 'userEmail',
      Cell: UserEmail,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.registered.learners.table.lms_user_created.column.heading',
        defaultMessage: 'Account Created',
        description: 'Column heading for the lms user created column in the registered learners table',
      }),
      accessor: 'lmsUserCreated',
      Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.lmsUserCreated }),
    },
  ];

  const {
    isLoading,
    data: registeredLearners,
    fetchData: fetchRegisteredLearners,
    fetchDataImmediate,
    hasData,
  } = useRegisteredLearners(enterpriseId, id, apiFieldsForColumnAccessor);

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

  const fetchTableData = useCallback((tableState) => {
    const newPageForUrl = tableState.pageIndex + 1; // Convert zero-based index to one-based for URL
    updateUrlWithPageNumber(id, newPageForUrl, location, navigate);

    return fetchRegisteredLearners(tableState);
  }, [fetchRegisteredLearners]);

  return (
    <DataTable
      id={id}
      className="registered-unenrolled-learners"
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
        sortBy: [],
        selectedRowsOrdered: [],
      }}
      fetchData={fetchTableData}
      data={registeredLearners.results}
      itemCount={registeredLearners.itemCount}
      pageCount={registeredLearners.pageCount}
    />
  );
};

RegisteredLearnersTable.propTypes = {
  id: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(RegisteredLearnersTable);

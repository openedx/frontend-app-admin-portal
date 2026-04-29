import React, {
  useCallback, useState,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DataTable } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

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

const CompletedLearnersTable = ({ enterpriseId }) => {
  const intl = useIntl();

  const [tableData, setTableData] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.completed.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the completed learners table',
      }),
      accessor: 'user_email',
      Cell: UserEmailCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.completed.learned.table.completed_courses.column.heading',
        defaultMessage: 'Total Course Completed Count',
        description: 'Column heading for the completed courses column in the completed learners table',
      }),
      accessor: 'completed_courses',
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
        const response = await EnterpriseDataApiService.fetchCompletedLearners(
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
      className="completed-learners"
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
          id: 'admin.portal.lpr.completed.learners.table.empty',
          defaultMessage: 'No results found.',
          description: 'Empty state message for the completed learners table',
        })}
      />
      <DataTable.TableFooter />
    </DataTable>
  );
};

CompletedLearnersTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(CompletedLearnersTable);

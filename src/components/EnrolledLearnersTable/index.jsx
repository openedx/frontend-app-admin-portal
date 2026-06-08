import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Alert, DataTable } from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';

import { i18nFormatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrolledLearnersTable = ({ enterpriseId }) => {
  const intl = useIntl();
  const [data, setData] = React.useState([]);
  const [itemCount, setItemCount] = React.useState(0);
  const [pageCount, setPageCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const tableColumns = React.useMemo(() => [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the enrolled learners table',
      }),
      accessor: 'user_email',
      Cell: ({ value }) => <span data-hj-suppress>{value}</span>,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.table.lms_user_created.column.heading',
        defaultMessage: 'Account Created',
        description: 'Column heading for the lms user created column in the enrolled learners table',
      }),
      accessor: 'lms_user_created',
      Cell: ({ value }) => i18nFormatTimestamp({
        intl,
        timestamp: value,
      }),
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.table.enrollment_count.column.heading',
        defaultMessage: 'Total Course Enrollment Count',
        description: 'Column heading for the course enrollment count column in the enrolled learners table',
      }),
      accessor: 'enrollment_count',
    },
  ], [intl]);

  const fetchData = React.useCallback(async ({ pageIndex = 0, pageSize = 50, sortBy = [] } = {}) => {
    const latestSort = sortBy[sortBy.length - 1];
    const options = {
      page: pageIndex + 1,
      page_size: pageSize,
    };

    if (latestSort?.id) {
      options.ordering = `${latestSort.desc ? '-' : ''}${latestSort.id}`;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await EnterpriseDataApiService.fetchEnrolledLearners(enterpriseId, options);
      const responseData = response?.data || {};
      const results = responseData.results || [];

      setData(results);
      setItemCount(responseData.count ?? results.length);
      setPageCount(responseData.num_pages ?? 1);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [enterpriseId]);

  return (
    <>
      {error && (
        <Alert variant="danger" icon={Error}>
          <Alert.Heading>Unable to load data</Alert.Heading>
          <p>Try refreshing your screen {error.message}</p>
        </Alert>
      )}
      <DataTable
        isLoading={isLoading}
        isPaginated
        manualPagination
        isSortable
        manualSortBy
        initialState={{
          pageSize: 50,
          pageIndex: 0,
        }}
        data={data}
        itemCount={itemCount}
        pageCount={pageCount}
        fetchData={fetchData}
        columns={tableColumns}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable content="There are no results." />
        <DataTable.TableFooter />
      </DataTable>
    </>
  );
};

EnrolledLearnersTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(EnrolledLearnersTable);

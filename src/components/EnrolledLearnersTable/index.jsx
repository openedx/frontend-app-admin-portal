import React, {
  useCallback, useRef, useState,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { DataTable, Alert } from '@openedx/paragon';
import { Error as ErrorIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import { i18nFormatTimestamp } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const TABLE_ID = 'enrolled-learners';

/** Suppresses PII from session-recording tools (e.g. Hotjar). */
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

/** Formats the account-created timestamp using the active locale. */
const AccountCreatedCell = ({ row }) => {
  const intl = useIntl();
  return i18nFormatTimestamp({ intl, timestamp: row.original.lms_user_created });
};
AccountCreatedCell.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.shape({
      lms_user_created: PropTypes.string,
    }),
  }).isRequired,
};

const EnrolledLearnersTable = ({ enterpriseId }) => {
  const intl = useIntl();
  const isInitialFetch = useRef(true);
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState({
    results: [],
    itemCount: 0,
    pageCount: 0,
  });

  const fetchData = useCallback((args) => {
    const options = {};

    const sortBy = args.sortBy?.[0];
    if (sortBy) {
      options.ordering = `${sortBy.desc ? '-' : ''}${sortBy.id}`;
    }
    options.page = (args.pageIndex ?? 0) + 1;

    if (!isInitialFetch.current) {
      if (sortBy) {
        sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.sorted', {
          tableId: TABLE_ID,
          column: sortBy.id,
          direction: sortBy.desc ? 'desc' : 'asc',
        });
      } else {
        sendEnterpriseTrackEvent(enterpriseId, 'edx.ui.enterprise.admin_portal.table.paginated', {
          tableId: TABLE_ID,
          page: options.page,
        });
      }
    }
    isInitialFetch.current = false;

    setIsLoading(true);
    setFetchError(null);
    EnterpriseDataApiService.fetchEnrolledLearners(enterpriseId, options)
      .then((response) => {
        setTableData({
          results: response.data.results,
          itemCount: response.data.count,
          pageCount: response.data.num_pages,
        });
      })
      .catch((err) => {
        logError(err);
        setFetchError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [enterpriseId]);

  const columns = [
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.table.user_email.column.heading',
        defaultMessage: 'Email',
        description: 'Column heading for the user email column in the enrolled learners table',
      }),
      accessor: 'user_email',
      Cell: UserEmailCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.table.lms_user_created.column.heading',
        defaultMessage: 'Account Created',
        description: 'Column heading for the lms user created column in the enrolled learners table',
      }),
      accessor: 'lms_user_created',
      Cell: AccountCreatedCell,
    },
    {
      Header: intl.formatMessage({
        id: 'admin.portal.lpr.enrolled.learners.table.enrollment_count.column.heading',
        defaultMessage: 'Total Course Enrollment Count',
        description: 'Column heading for the course enrollment count column in the enrolled learners table',
      }),
      accessor: 'enrollment_count',
    },
  ];

  return (
    <>
      {fetchError && (
        <Alert variant="danger" icon={ErrorIcon}>
          <Alert.Heading>Unable to load data</Alert.Heading>
          <p>
            Try refreshing your screen
            {fetchError.message}
          </p>
        </Alert>
      )}
      <DataTable
        isSortable
        manualSortBy
        isPaginated
        manualPagination
        isLoading={isLoading}
        columns={columns}
        data={tableData.results}
        itemCount={tableData.itemCount}
        pageCount={tableData.pageCount}
        fetchData={fetchData}
        initialState={{
          pageSize: 50,
          pageIndex: 0,
        }}
      >
        <DataTable.TableControlBar />
        <DataTable.Table />
        <DataTable.EmptyTable
          content={intl.formatMessage({
            id: 'admin.portal.lpr.enrolled.learners.table.empty',
            defaultMessage: 'There are no results.',
            description: 'Message shown when there are no enrolled learners to display',
          })}
        />
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

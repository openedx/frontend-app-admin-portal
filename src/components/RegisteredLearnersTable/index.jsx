import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable } from '@openedx/paragon';
import { connect } from 'react-redux';
import useRegisteredLearners from './data/hooks/useRegisteredLearners';
import { i18nFormatTimestamp } from '../../utils';

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

const RegisteredLearnersTable = ({ enterpriseId }) => {
  const intl = useIntl();
  const {
    isLoading,
    registeredLearners: tableData,
    fetchRegisteredLearners: fetchTableData,
  } = useRegisteredLearners(enterpriseId);

  return (
    <DataTable
      isSortable
      manualSortBy
      isPaginated
      manualPagination
      isLoading={isLoading}
      columns={[
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
      ]}
      initialState={{
        pageSize: 20, // Set this according to your requirements
        pageIndex: 0,
        sortBy: [{ id: 'lmsUserCreated', desc: true }],
      }}
      fetchData={fetchTableData}
      data={tableData.results}
      itemCount={tableData.itemCount}
      pageCount={tableData.pageCount}
    />
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

RegisteredLearnersTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(RegisteredLearnersTable);

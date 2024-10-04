import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import { DataTable, TextFilter } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DEFAULT_PAGE, PAGE_SIZE } from '../learner-credit-management/data';
import useEnrolledLearners from './data/hooks/useEnrolledLearners';
import { i18nFormatTimestamp } from '../../utils';

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

const EnrolledLearnersTable = ({ enterpriseId }) => {
  const intl = useIntl();
  const {
    isLoading,
    enrolledLearners: tableData,
    fetchEnrolledLearners: fetchTableData,
  } = useEnrolledLearners(enterpriseId);

  return (
    <DataTable
      isSortable
      manualSortBy
      isPaginated
      manualPagination
      isFilterable
      manualFilters
      isLoading={isLoading}
      FilterStatusComponent={FilterStatus}
      defaultColumnValues={{ Filter: TextFilter }}
      columns={[
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.enrolled.learners.table.user_email.column.heading',
            defaultMessage: 'Email',
            description: 'Column heading for the user email column in the enrolled learners table',
          }),
          accessor: 'userEmail',
          Cell: UserEmail,
        },
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.enrolled.learners.table.lms_user_created.column.heading',
            defaultMessage: 'Account Created',
            description: 'Column heading for the lms user created column in the enrolled learners table',
          }),
          accessor: 'lmsUserCreated',
          Cell: ({ row }) => i18nFormatTimestamp({ intl, timestamp: row.values.lmsUserCreated }),
          disableFilters: true,
        },
        {
          Header: intl.formatMessage({
            id: 'admin.portal.lpr.enrolled.learners.table.enrollment_count.column.heading',
            defaultMessage: 'Total Course Enrollment Count',
            description: 'Column heading for the course enrollment count column in the enrolled learners table',
          }),
          accessor: 'enrollmentCount',
          disableFilters: true,
        },
      ]}
      initialState={{
        pageSize: PAGE_SIZE,
        pageIndex: DEFAULT_PAGE,
        sortBy: [
          { id: 'lmsUserCreated', desc: true },
        ],
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

EnrolledLearnersTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(EnrolledLearnersTable);

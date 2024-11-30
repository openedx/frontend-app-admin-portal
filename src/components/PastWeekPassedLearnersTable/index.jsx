import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable } from '@openedx/paragon';
import { connect } from 'react-redux';
import usePastWeekPassedLearners from './data/hooks/usePastWeekPassedLearners';
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

const PastWeekPassedLearnersTable = ({ enterpriseId }) => {
  const intl = useIntl();
  const {
    isLoading,
    pastWeekPassedLearners: tableData,
    fetchPastWeekPassedLearners: fetchTableData,
  } = usePastWeekPassedLearners(enterpriseId);

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
      ]}
      initialState={{
        pageSize: 20, // Set this according to your requirements
        pageIndex: 0,
        sortBy: [{ id: 'passedDate', desc: true }],
        selectedRowsOrdered: [],
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

PastWeekPassedLearnersTable.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(PastWeekPassedLearnersTable);

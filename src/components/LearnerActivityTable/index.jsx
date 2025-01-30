import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import { DataTable, TextFilter } from '@openedx/paragon';
import { connect } from 'react-redux';
import useCourseEnrollments from './data/hooks/useCourseEnrollments';
import { DEFAULT_PAGE, PAGE_SIZE } from '../../data/constants/table';
import {
  i18nFormatTimestamp,
  i18nFormatPassedTimestamp,
  i18nFormatProgressStatus,
  formatPercentage,
} from '../../utils';
import { formatPrice } from '../learner-credit-management/data';

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

const LearnerActivityTable = ({ id, enterpriseId, activity }) => {
  const intl = useIntl();
  const {
    isLoading,
    courseEnrollments: tableData,
    fetchCourseEnrollments: fetchTableData,
  } = useCourseEnrollments(enterpriseId, id);

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
      isSortable
      manualSortBy
      isPaginated
      manualPagination
      isLoading={isLoading}
      FilterStatusComponent={FilterStatus}
      defaultColumnValues={{ Filter: TextFilter }}
      columns={columns}
      initialState={{
        pageIndex: DEFAULT_PAGE,
        pageSize: PAGE_SIZE,
        sortBy: [{ id: 'lastActivityDate', desc: true }],
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

LearnerActivityTable.propTypes = {
  id: PropTypes.string.isRequired,
  enterpriseId: PropTypes.string.isRequired,
  activity: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(LearnerActivityTable);

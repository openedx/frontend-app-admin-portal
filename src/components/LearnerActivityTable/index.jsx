import React from 'react';
import PropTypes from 'prop-types';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp, formatPassedTimestamp, formatPercentage } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

class LearnerActivityTable extends React.Component {
  getTableColumns() {
    const { activity } = this.props;
    const tableColumns = [
      {
        Header: 'Email',
        accessor: 'user_email',
        columnSortable: true,
      },
      {
        Header: 'Course Title',
        accessor: 'course_title',
        columnSortable: true,
      },
      {
        Header: 'Course Price',
        accessor: 'course_list_price',
        columnSortable: true,
      },
      {
        Header: 'Start Date',
        accessor: 'course_start_date',
        columnSortable: true,
      },
      {
        Header: 'End Date',
        accessor: 'course_end_date',
        columnSortable: true,
      },
      {
        Header: 'Passed Date',
        accessor: 'passed_date',
        columnSortable: true,
      },
      {
        Header: 'Current Grade',
        accessor: 'current_grade',
        columnSortable: true,
      },
      {
        Header: 'Progress Status',
        accessor: 'progress_status',
        columnSortable: true,
      },
      {
        Header: 'Last Activity Date',
        accessor: 'last_activity_date',
        columnSortable: true,
      },
    ];

    if (activity !== 'active_past_week') {
      return tableColumns.filter(column => column.key !== 'passed_date');
    }
    return tableColumns;
  }

  formatTableData = enrollments => enrollments.map(enrollment => ({
    ...enrollment,
    user_email: <span data-hj-suppress>{enrollment.user_email}</span>,
    last_activity_date: formatTimestamp({ timestamp: enrollment.last_activity_date }),
    course_start_date: formatTimestamp({ timestamp: enrollment.course_start_date }),
    course_end_date: formatTimestamp({ timestamp: enrollment.course_end_date }),
    enrollment_date: formatTimestamp({
      timestamp: enrollment.enrollment_date,
    }),
    passed_date: formatPassedTimestamp(enrollment.passed_date),
    user_account_creation_date: formatTimestamp({
      timestamp: enrollment.user_account_creation_date,
    }),
    progress_status: enrollment.progress_status,
    course_list_price: enrollment.course_list_price ? `$${enrollment.course_list_price}` : '',
    current_grade: formatPercentage({ decimal: enrollment.current_grade }),
  }));

  render() {
    const { activity, id } = this.props;

    return (
      <TableContainer
        id={id}
        className={id}
        key={id}
        fetchMethod={(enterpriseId, options) => EnterpriseDataApiService.fetchCourseEnrollments(
          enterpriseId,
          {
            learner_activity: activity,
            ...options,
          },
        )}
        columns={this.getTableColumns()}
        formatData={this.formatTableData}
        tableSortable
      />
    );
  }
}

LearnerActivityTable.propTypes = {
  id: PropTypes.string.isRequired,
  activity: PropTypes.string.isRequired,
};

export default LearnerActivityTable;

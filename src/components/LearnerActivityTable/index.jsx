import React from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import TableContainer from '../../containers/TableContainer';
import {
  i18nFormatTimestamp, formatPercentage,
} from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

class LearnerActivityTable extends React.Component {
  getTableColumns() {
    const { intl } = this.props;
    const tableColumns = [
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.user_email.column.heading',
          defaultMessage: 'Email',
          description: 'Column heading for the user email column in the learner activity table',
        }),
        key: 'user_email',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.course_title.column.heading',
          defaultMessage: 'Course Title',
          description: 'Column heading for the course title column in the learner activity table',
        }),
        key: 'course_title',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.course_list_price.column.heading',
          defaultMessage: 'Course Price',
          description: 'Column heading for the course price column in the learner activity table',
        }),
        key: 'course_list_price',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.course_start_date.column.heading',
          defaultMessage: 'Start Date',
          description: 'Column heading for the course start date column in the learner activity table',
        }),
        key: 'course_start_date',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.course_end_date.column.heading',
          defaultMessage: 'End Date',
          description: 'Column heading for the course end date column in the learner activity table',
        }),
        key: 'course_end_date',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.course_progress.column.heading',
          defaultMessage: 'Course Progress',
          description: 'Column heading for the course progress column in the learner activity table',
        }),
        key: 'course_progress',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.course_passing_grade.column.heading',
          defaultMessage: 'Course Passing Grade',
          description: 'Column heading for the course passing grade column in the learner activity table',
        }),
        key: 'course_passing_grade',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.current_grade.column.heading',
          defaultMessage: 'Current Grade',
          description: 'Column heading for the current grade column in the learner activity table',
        }),
        key: 'current_grade',
        columnSortable: true,
      },
      {
        label: intl.formatMessage({
          id: 'admin.portal.lpr.learner.activity.table.enrollment_date.column.heading',
          defaultMessage: 'Last Activity Date',
          description: 'Column heading for the last activity date column in the learner activity table',
        }),
        key: 'last_activity_date',
        columnSortable: true,
      },
    ];

    return tableColumns;
  }

  formatTableData = enrollments => enrollments.map(enrollment => ({
    ...enrollment,
    user_email: <span data-hj-suppress>{enrollment.user_email}</span>,
    last_activity_date: i18nFormatTimestamp({ intl: this.props.intl, timestamp: enrollment.last_activity_date }),
    course_start_date: i18nFormatTimestamp({ intl: this.props.intl, timestamp: enrollment.course_start_date }),
    course_end_date: i18nFormatTimestamp({ intl: this.props.intl, timestamp: enrollment.course_end_date }),
    enrollment_date: i18nFormatTimestamp({
      intl: this.props.intl, timestamp: enrollment.enrollment_date,
    }),
    user_account_creation_date: i18nFormatTimestamp({
      intl: this.props.intl, timestamp: enrollment.user_account_creation_date,
    }),
    course_list_price: enrollment.course_list_price ? `$${enrollment.course_list_price}` : '',
    current_grade: formatPercentage({ decimal: enrollment.current_grade }),
    course_progress: formatPercentage({ decimal: enrollment.course_progress }),
    course_passing_grade: formatPercentage({ decimal: enrollment.course_passing_grade }),
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
            learnerActivity: activity,
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
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(LearnerActivityTable);

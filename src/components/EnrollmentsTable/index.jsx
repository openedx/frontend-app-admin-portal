import React from 'react';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp, formatPercentage } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrollmentsTable = (props) => {
  const enrollmentTableColumns = [
    {
      label: 'Email',
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: 'Course Title',
      key: 'course_title',
      columnSortable: true,
    },
    {
      label: 'Course Price',
      key: 'course_price',
      columnSortable: true,
    },
    {
      label: 'Start Date',
      key: 'course_start',
      columnSortable: true,
    },
    {
      label: 'End Date',
      key: 'course_end',
      columnSortable: true,
    },
    {
      label: 'Passed Date',
      key: 'passed_timestamp',
      columnSortable: true,
    },
    {
      label: 'Current Grade',
      key: 'current_grade',
      columnSortable: true,
    },
    {
      label: 'Last Activity Date',
      key: 'last_activity_date',
      columnSortable: true,
    },
  ];


  const formatPassedTimestamp = (timestamp) => {
    if (timestamp) {
      return formatTimestamp({ timestamp });
    }
    return 'Has not passed';
  };

  const formatEnrollmentData = enrollments => enrollments.map(enrollment => ({
    ...enrollment,
    last_activity_date: formatTimestamp({ timestamp: enrollment.last_activity_date }),
    course_start: formatTimestamp({ timestamp: enrollment.course_start }),
    course_end: formatTimestamp({ timestamp: enrollment.course_end }),
    enrollment_created_timestamp: formatTimestamp({
      timestamp: enrollment.enrollment_created_timestamp,
    }),
    passed_timestamp: formatPassedTimestamp(enrollment.passed_timestamp),
    user_account_creation_timestamp: formatTimestamp({
      timestamp: enrollment.user_account_creation_timestamp,
    }),
    has_passed: enrollment.has_passed ? 'Yes' : 'No',
    course_price: enrollment.course_price ? `$${enrollment.course_price}` : '',
    current_grade: formatPercentage({ decimal: enrollment.current_grade }),
  }));

  return (
    <TableContainer
      id="enrollments"
      className="enrollments"
      fetchMethod={EnterpriseDataApiService.fetchCourseEnrollments}
      columns={enrollmentTableColumns}
      formatData={formatEnrollmentData}
      fetchParams={props.fetchParams}
      tableSortable
    />
  );
};

export default EnrollmentsTable;

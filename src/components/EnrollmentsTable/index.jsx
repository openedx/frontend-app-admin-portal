import React from 'react';

import { useIntl } from '@edx/frontend-platform/i18n';

import TableContainer from '../../containers/TableContainer';
import { formatTimestamp, formatPassedTimestamp, formatPercentage } from '../../utils';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

const EnrollmentsTable = () => {
  const intl = useIntl();

  const enrollmentTableColumns = [
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.user_email',
        defaultMessage: 'Email',
      }),
      key: 'user_email',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseTitle',
        defaultMessage: 'Course Title',
      }),
      key: 'course_title',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseListPrice',
        defaultMessage: 'Course Price',
      }),
      key: 'course_list_price',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseStartDate',
        defaultMessage: 'Start Date',
      }),
      key: 'course_start_date',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.courseEndDate',
        defaultMessage: 'End Date',
      }),
      key: 'course_end_date',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.passedDate',
        defaultMessage: 'Passed Date',
      }),
      key: 'passed_date',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.currentGrade',
        defaultMessage: 'Current Grade',
      }),
      key: 'current_grade',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.progressStatus',
        defaultMessage: 'Progress Status',
      }),
      key: 'progress_status',
      columnSortable: true,
    },
    {
      label: intl.formatMessage({
        id: 'adminPortal.enrollmentsTable.lastActivityDate',
        defaultMessage: 'Last Activity Date',
      }),
      key: 'last_activity_date',
      columnSortable: true,
    },
  ];

  const formatEnrollmentData = enrollments => enrollments.map(enrollment => ({
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

  return (
    <TableContainer
      id="enrollments"
      className="enrollments"
      fetchMethod={EnterpriseDataApiService.fetchCourseEnrollments}
      columns={enrollmentTableColumns}
      formatData={formatEnrollmentData}
      tableSortable
    />
  );
};

export default EnrollmentsTable;

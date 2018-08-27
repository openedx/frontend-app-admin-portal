import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { withRouter } from 'react-router';

import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';
import TableWithPagination from '../TableWithPagination';
import { formatTableOptions, formatTimestamp, formatPercentage } from '../../utils';

export class CourseEnrollments extends React.Component {
  constructor(props) {
    super(props);

    const { enrollments } = props;

    this.state = {
      columns: [
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
      ],
      enrollments: enrollments && enrollments.results,
      pageCount: enrollments && enrollments.num_pages,
    };

    this.formatEnrollmentData = this.formatEnrollmentData.bind(this);
  }

  componentDidMount() {
    const { enterpriseId, location } = this.props;

    if (enterpriseId) {
      const options = qs.parse(location.search);
      this.getCourseEnrollments(enterpriseId, formatTableOptions(options));
    }
  }

  componentDidUpdate(prevProps) {
    const { enterpriseId, enrollments, location } = this.props;

    if (enrollments !== prevProps.enrollments) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        enrollments: enrollments && enrollments.results,
        pageCount: enrollments && enrollments.num_pages,
      });
    }

    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      const options = qs.parse(location.search);
      this.getCourseEnrollments(enterpriseId, formatTableOptions(options));
    }
  }

  getCourseEnrollments(enterpriseId, options) {
    this.props.getCourseEnrollments(enterpriseId, options);
  }

  formatPassedTimestamp(timestamp) {
    if (timestamp) {
      return formatTimestamp({ timestamp });
    }
    return 'Has not passed';
  }

  formatEnrollmentData(enrollments) {
    if (!enrollments) {
      return null;
    } else if (!enrollments.length) {
      return [];
    }

    return enrollments.map(enrollment => ({
      ...enrollment,
      last_activity_date: formatTimestamp({ timestamp: enrollment.last_activity_date }),
      course_start: formatTimestamp({ timestamp: enrollment.course_start }),
      course_end: formatTimestamp({ timestamp: enrollment.course_end }),
      enrollment_created_timestamp: formatTimestamp({
        timestamp: enrollment.enrollment_created_timestamp,
      }),
      passed_timestamp: this.formatPassedTimestamp(enrollment.passed_timestamp),
      user_account_creation_timestamp: formatTimestamp({
        timestamp: enrollment.user_account_creation_timestamp,
      }),
      has_passed: enrollment.has_passed ? 'Yes' : 'No',
      course_price: enrollment.course_price ? `$${enrollment.course_price}` : '',
      current_grade: formatPercentage({ decimal: enrollment.current_grade }),
    }));
  }

  renderEmptyCourseEnrollmentsMessage() {
    return (
      <StatusAlert
        alertType="warning"
        iconClassName={['fa', 'fa-exclamation-circle']}
        message="There are no course enrollments."
      />
    );
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to load full report"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderTableContent() {
    const {
      columns,
      enrollments,
      pageCount,
    } = this.state;

    return (
      <TableWithPagination
        columns={columns}
        data={enrollments}
        pageCount={pageCount}
        paginationLabel="course enrollments pagination"
        tableSortable
        handleDataUpdate={options =>
          this.getCourseEnrollments(this.props.enterpriseId, options)
        }
        formatData={this.formatEnrollmentData}
      />
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="course-enrollments" />;
  }

  render() {
    const { loading, error } = this.props;
    const { enrollments } = this.state;

    return (
      <div>
        {error && this.renderErrorMessage()}
        {loading && !enrollments && this.renderLoadingMessage()}
        {!loading && !error && enrollments && enrollments.length === 0 &&
          this.renderEmptyCourseEnrollmentsMessage()
        }
        {enrollments && enrollments.length > 0 && this.renderTableContent()}
      </div>
    );
  }
}

CourseEnrollments.defaultProps = {
  enrollments: null,
  enterpriseId: null,
  error: null,
  loading: false,
  location: {
    search: null,
  },
};

CourseEnrollments.propTypes = {
  getCourseEnrollments: PropTypes.func.isRequired,
  enrollments: PropTypes.shape({
    count: PropTypes.number,
    num_pages: PropTypes.number,
    current_page: PropTypes.number,
    results: PropTypes.array,
    next: PropTypes.string,
    previous: PropTypes.string,
    start: PropTypes.number,
  }),
  enterpriseId: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
};

export default withRouter(CourseEnrollments);

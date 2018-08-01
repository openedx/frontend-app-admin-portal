import React from 'react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { withRouter } from 'react-router';

import StatusAlert from '../StatusAlert';
import LoadingMessage from '../LoadingMessage';
import TableWithPagination from '../TableWithPagination';
import { formatTableOptions, formatTimestamp } from '../../utils';

import './CourseEnrollments.scss';

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
          label: 'Enrollment Date',
          key: 'enrollment_created_timestamp',
          columnSortable: true,
        },
        {
          label: 'Passed Date',
          key: 'passed_timestamp',
          columnSortable: true,
        },
        {
          label: 'Enrollment Mode',
          key: 'user_current_enrollment_mode',
          columnSortable: true,
        },
        {
          label: 'Course Price',
          key: 'course_price',
          columnSortable: true,
        },
        {
          label: 'Coupon Name',
          key: 'coupon_name',
          columnSortable: true,
        },
        {
          label: 'Enterprise Offers',
          key: 'offer',
          columnSortable: true,
        },
      ],
      enrollments: this.formatEnrollmentData(enrollments),
      pageCount: enrollments ? enrollments.num_pages : null,
    };

    this.renderTableContent = this.renderTableContent.bind(this);
  }

  componentDidMount() {
    const { enterpriseId } = this.props;

    if (enterpriseId) {
      this.getCourseEnrollments(enterpriseId);
    }
  }

  componentDidUpdate(prevProps) {
    const { enterpriseId, enrollments, location } = this.props;

    if (enrollments !== prevProps.enrollments) {
      this.setState({ // eslint-disable-line react/no-did-update-set-state
        enrollments: this.formatEnrollmentData(enrollments),
        pageCount: enrollments ? enrollments.num_pages : null,
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
    } else if (!enrollments.results.length) {
      return [];
    }

    return enrollments.results.map(enrollment => ({
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
      course_price: `$${enrollment.course_price}`,
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

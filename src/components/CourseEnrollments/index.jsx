import React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import qs from 'query-string';
import moment from 'moment';
import { omitBy, isNaN } from 'lodash';
import { Table, StatusAlert, Pagination } from '@edx/paragon';
import 'font-awesome/css/font-awesome.css';

import './CourseEnrollments.scss';

const StatusMessage = props => (
  <StatusAlert
    alertType={props.alertType}
    dismissible={false}
    dialog={props.message}
    open
  />
);

export class CourseEnrollments extends React.Component {
  constructor(props) {
    super(props);

    const { enrollments, location } = props;
    const queryParams = this.formatOptions(qs.parse(location.search));

    // TODO: enterprise uuid will be retrieved from data we get back about user
    // during authentication.
    this.enterpriseId = 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c';

    this.state = {
      columns: [
        {
          label: 'Email',
          key: 'user_email',
        },
        {
          label: 'Course',
          key: 'course_title',
        },
        {
          label: 'Course End',
          key: 'course_end',
        },
        {
          label: 'Mode',
          key: 'user_current_enrollment_mode',
        },
        {
          label: 'Passed',
          key: 'has_passed',
        },
        {
          label: 'Last Activity Date',
          key: 'last_activity_date',
        },
      ],
      enrollments: this.formatEnrollmentData(enrollments.results),
      currentPage: queryParams.page,
      pageSize: queryParams.page_size,
    };

    this.handleTablePageSelect = this.handleTablePageSelect.bind(this);
    this.renderTableContent = this.renderTableContent.bind(this);
  }

  componentDidMount() {
    // TODO: enterprise uuid will be retrieved from data we get back about user
    // during authentication.
    const options = this.formatOptions({
      page: this.state.currentPage,
      page_size: this.state.pageSize,
    });
    this.props.getCourseEnrollments(this.enterpriseId, options);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.enrollments !== this.props.enrollments) {
      this.setState({
        enrollments: this.formatEnrollmentData(nextProps.enrollments.results),
      });
    }
  }

  formatOptions(options) {
    return omitBy({
      page: parseInt(options.page, 10),
      page_size: parseInt(options.page_size, 10),
    }, isNaN);
  }

  formatTimestamp({ timestamp, format = 'MMMM D, YYYY' }) {
    return timestamp ? moment(timestamp).format(format) : null;
  }

  formatEnrollmentData(enrollments) {
    if (!enrollments || !enrollments.length) {
      return [];
    }

    return enrollments.map(enrollment => ({
      ...enrollment,
      last_activity_date: this.formatTimestamp({ timestamp: enrollment.last_activity_date }),
      course_start: this.formatTimestamp({ timestamp: enrollment.course_start }),
      course_end: this.formatTimestamp({ timestamp: enrollment.course_end }),
      enrollment_created_timestamp: this.formatTimestamp({
        timestamp: enrollment.enrollment_created_timestamp,
      }),
      passed_timestamp: this.formatTimestamp({ timestamp: enrollment.passed_timestamp }),
      user_account_creation_timestamp: this.formatTimestamp({
        timestamp: enrollment.user_account_creation_timestamp,
      }),
      has_passed: enrollment.has_passed ? 'Yes' : 'No',
    }));
  }

  handleTablePageSelect(page) {
    const options = this.formatOptions({
      page,
      page_size: this.state.pageSize,
    });

    this.props.getCourseEnrollments(this.enterpriseId, options);
    this.props.history.push(`?${qs.stringify(options)}`);
    this.setState({
      currentPage: page,
    });
  }

  renderEmptyCourseEnrollmentsMessage() {
    return <StatusMessage alertType="warning" message="There are no course enrollments." />;
  }

  renderErrorMessage() {
    const message = `There was a problem fetching course enrollments: ${this.props.error.message}`;
    return <StatusMessage alertType="danger" message={message} />;
  }

  renderTableContent() {
    const {
      columns,
      enrollments,
    } = this.state;

    return (
      <div className={this.props.className}>
        <div className="row">
          <div className="col">
            <div className="table-responsive">
              <Table
                className={['table-sm', 'table-striped']}
                columns={columns}
                data={enrollments}
              />
            </div>
          </div>
        </div>
        <div className="row mt-2">
          <div className="col d-flex justify-content-center">
            <Pagination
              paginationLabel="Course Enrollments Pagination"
              pageCount={this.props.enrollments.num_pages}
              onPageSelect={this.handleTablePageSelect}
              currentPage={this.state.currentPage}
            />
          </div>
        </div>
      </div>
    );
  }

  renderLoadingMessage() {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  render() {
    const { loading, error } = this.props;
    const { enrollments } = this.state;
    return (
      <div>
        {error && this.renderErrorMessage()}
        {loading && !enrollments.length && this.renderLoadingMessage()}
        {!loading && !error && !enrollments.length &&
          this.renderEmptyCourseEnrollmentsMessage()
        }
        {enrollments.length > 0 && this.renderTableContent()}
      </div>
    );
  }
}

CourseEnrollments.defaultProps = {
  enrollments: {},
  error: null,
  loading: false,
  location: {
    search: '',
  },
  history: {},
  className: undefined,
};

CourseEnrollments.propTypes = {
  getCourseEnrollments: PropTypes.func.isRequired,
  className: PropTypes.string,
  enrollments: PropTypes.shape({
    count: PropTypes.number,
    num_pages: PropTypes.number,
    current_page: PropTypes.number,
    results: PropTypes.array,
    next: PropTypes.string,
    previous: PropTypes.string,
    start: PropTypes.number,
  }),
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

StatusMessage.propTypes = {
  message: PropTypes.string.isRequired,
  alertType: PropTypes.string.isRequired,
};

export default withRouter(CourseEnrollments);

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import qs from 'query-string';
import moment from 'moment';
import { Table, StatusAlert } from '@edx/paragon';

import H1 from '../../components/H1';

const StatusMessage = props => (
  <StatusAlert
    alertType={props.alertType}
    dismissible={false}
    dialog={props.message}
    open
  />
);

class CourseEnrollments extends React.Component {
  constructor(props) {
    super(props);

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
          label: 'Passed Date',
          key: 'passed_timestamp',
        },
      ],
      enrollments: [],
      currentPage: 1,
    };

    this.handleTablePageSelect = this.handleTablePageSelect.bind(this);
    this.renderTableContent = this.renderTableContent.bind(this);
  }

  componentWillMount() {
    const { location } = this.props;
    const queryParams = location ? qs.parse(location.search) : {};
    const { page } = queryParams;

    if (page) {
      this.setState({
        currentPage: parseInt(page, 10),
      });
    }
  }

  componentDidMount() {
    // TODO: enterprise uuid will be retrieved from data we get back about user
    // during authentication.
    const enterpriseId = 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c';
    this.props.getCourseEnrollments({
      enterpriseId,
      page: this.state.currentPage,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.enrollments !== this.props.enrollments) {
      this.setState({
        enrollments: this.formatEnrollmentData(nextProps.enrollments.results),
      });
    }
  }

  formatTimestamp(timestamp) {
    return moment(timestamp).format('MMMM D, YYYY');
  }

  formatEnrollmentData(enrollments) {
    if (!enrollments || !enrollments.length) {
      return [];
    }

    return enrollments.map(enrollment => ({
      ...enrollment,
      passed_timestamp: this.formatTimestamp(enrollment.passed_timestamp),
      course_end: this.formatTimestamp(enrollment.course_end),
      has_passed: enrollment.has_passed ? 'Yes' : 'No',
    }));
  }

  handleTablePageSelect(page) {
    this.props.getCourseEnrollments(page).then(() => {
      this.setState({
        currentPage: page,
      });
      this.props.history.push(`?page=${page}`);
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
      <div>
        <div className="table-responsive">
          <Table
            className={['table-sm', 'table-striped']}
            columns={columns}
            data={enrollments}
          />
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
      <div className="container">
        <Helmet>
          <title>Course Enrollments</title>
        </Helmet>
        <H1>Course Enrollments</H1>
        {error && this.renderErrorMessage()}
        {loading && !enrollments.length && this.renderLoadingMessage()}
        {!loading && !error && !enrollments.length && this.renderEmptyCourseEnrollmentsMessage()}
        {enrollments.length > 0 && this.renderTableContent()}
      </div>
    );
  }
}

CourseEnrollments.defaultProps = {
  enrollments: {},
  error: null,
  loading: false,
  location: {},
  history: {},
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

export default CourseEnrollments;

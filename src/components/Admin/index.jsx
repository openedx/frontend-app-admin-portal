import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { StatusAlert, MailtoLink } from '@edx/paragon';

import H1 from '../../components/H1';
import H2 from '../../components/H2';
import NumberCard from '../../components/NumberCard';
import CourseEnrollmentsTable from '../../containers/CourseEnrollmentsTable';

import './Admin.scss';

const StatusMessage = props => (
  <StatusAlert
    alertType={props.alertType}
    dismissible={false}
    dialog={props.message}
    open
  />
);

class Admin extends React.Component {
  componentDidMount() {
    // TODO: enterprise uuid will be retrieved from data we get back about user
    // during authentication.
    const enterpriseId = 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c';
    this.props.getDashboardAnalytics(enterpriseId);
  }

  hasAnalyticsData() {
    const {
      activeLearners,
      courseCompletions,
      enrolledLearners,
    } = this.props;
    let hasAnalyticsData = false;

    [activeLearners, courseCompletions, enrolledLearners].forEach((item) => {
      hasAnalyticsData = item !== null || hasAnalyticsData;
    });

    return hasAnalyticsData;
  }

  renderErrorMessage() {
    const message = `There was a problem fetching dashboard data: ${this.props.error.message}`;
    return <StatusMessage alertType="danger" message={message} />;
  }

  renderLoadingMessage() {
    return (
      <div className="loading">
        <p>Loading...</p>
      </div>
    );
  }

  render() {
    const {
      activeLearners,
      courseCompletions,
      enrolledLearners,
      error,
      loading,
    } = this.props;

    return (
      <div className="container">
        <Helmet>
          <title>edX Learner and Progress Report</title>
        </Helmet>
        <div className="row">
          <div className="col">
            <H1>edX Learner and Progress Report</H1>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <H2>Overview</H2>
            {error && this.renderErrorMessage()}
            {loading && this.renderLoadingMessage()}
            {!loading && !error && this.hasAnalyticsData() &&
              <div className="row mt-3 equal-col-height">
                <div className="col-xs-12 col-md-6 col-xl-3 mb-3">
                  <NumberCard
                    title="X"
                    description="total number of learners registered"
                    iconClassName="fa fa-users"
                  />
                </div>
                <div className="col-xs-12 col-md-6 col-xl-3 mb-3">
                  <NumberCard
                    title={enrolledLearners}
                    description="learners enrolled in at least one course"
                    iconClassName="fa fa-check"
                  />
                </div>
                <div className="col-xs-12 col-md-6 col-xl-3 mb-3">
                  <NumberCard
                    title={activeLearners.past_week}
                    description="active learners in the past week"
                    iconClassName="fa fa-eye"
                  />
                </div>
                <div className="col-xs-12 col-md-6 col-xl-3 mb-3">
                  <NumberCard
                    title={courseCompletions}
                    description="course completions"
                    iconClassName="fa fa-trophy"
                  />
                </div>
              </div>
            }
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <H2>Full Report</H2>
            <CourseEnrollmentsTable className="mt-3" />
          </div>
        </div>
        <div className="row mt-4">
          <div className="col">
            <p>
              For more information, contact edX Enterprise Support at <MailtoLink to="enterprise@edx.org" content=" enterprise@edx.org" />.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

Admin.defaultProps = {
  error: null,
  loading: false,
  courseCompletions: null,
  activeLearners: null,
  enrolledLearners: null,
};

Admin.propTypes = {
  getDashboardAnalytics: PropTypes.func.isRequired,
  activeLearners: PropTypes.shape({
    past_week: PropTypes.number,
    past_month: PropTypes.number,
  }),
  enrolledLearners: PropTypes.number,
  courseCompletions: PropTypes.number,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

StatusMessage.propTypes = {
  message: PropTypes.string.isRequired,
  alertType: PropTypes.string.isRequired,
};

export default Admin;

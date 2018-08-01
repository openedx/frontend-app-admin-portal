import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { MailtoLink, Button } from '@edx/paragon';

import H2 from '../../components/H2';
import Hero from '../../components/Hero';
import NumberCard from '../../components/NumberCard';
import StatusAlert from '../../components/StatusAlert';
import LoadingMessage from '../../components/LoadingMessage';
import CourseEnrollmentsTable from '../../containers/CourseEnrollmentsTable';

import { formatTimestamp } from '../../utils';

import './Admin.scss';

class Admin extends React.Component {
  componentDidMount() {
    const { enterpriseId } = this.props;

    if (enterpriseId) {
      this.props.getDashboardAnalytics(enterpriseId);
    }
  }

  componentDidUpdate(prevProps) {
    const { enterpriseId } = this.props;
    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.props.getDashboardAnalytics(enterpriseId);
    }
  }

  hasAnalyticsData() {
    const {
      activeLearners,
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
    } = this.props;
    let hasAnalyticsData = false;

    [activeLearners, courseCompletions, enrolledLearners, numberOfUsers].forEach((item) => {
      hasAnalyticsData = item !== null || hasAnalyticsData;
    });

    return hasAnalyticsData;
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        className={['mt-3']}
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to load overview"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="overview mt-3" />;
  }

  render() {
    const {
      activeLearners,
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
      error,
      loading,
      downloadCsv,
      enterpriseId,
      lastUpdatedDate,
    } = this.props;

    return (
      <div>
        <Helmet>
          <title>Learner and Progress Report</title>
        </Helmet>
        <Hero title="Learner and Progress Report" />
        <div className="container">
          <div className="row mt-4">
            <div className="col">
              <H2>Overview</H2>
              {error && this.renderErrorMessage()}
              {loading && this.renderLoadingMessage()}
              {!loading && !error && this.hasAnalyticsData() &&
                <div className="row mt-3 equal-col-height">
                  <div className="col-xs-12 col-md-6 col-xl-3 mb-3">
                    <NumberCard
                      title={numberOfUsers}
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
              {!error && !loading &&
                <div className="row">
                  {lastUpdatedDate &&
                    <div className="col-12 col-md-6 py-3">
                      Showing data as of {formatTimestamp({ timestamp: lastUpdatedDate })}
                    </div>
                  }
                  <div className="col-12 col-md-6 text-md-right">
                    <Button
                      label={
                        <span>
                          <span className="fa fa-download" /> Download full report (CSV)
                        </span>
                      }
                      onClick={() => downloadCsv(enterpriseId)}
                      className={['btn-outline-primary']}
                    />
                  </div>
                </div>
              }
              <CourseEnrollmentsTable />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p>
                For more information, contact edX Enterprise Support at <MailtoLink to="enterprise@edx.org" content=" enterprise@edx.org" />.
              </p>
            </div>
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
  numberOfUsers: null,
  enrolledLearners: null,
  enterpriseId: null,
  lastUpdatedDate: null,
};

Admin.propTypes = {
  getDashboardAnalytics: PropTypes.func.isRequired,
  downloadCsv: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string,
  activeLearners: PropTypes.shape({
    past_week: PropTypes.number,
    past_month: PropTypes.number,
  }),
  enrolledLearners: PropTypes.number,
  numberOfUsers: PropTypes.number,
  courseCompletions: PropTypes.number,
  lastUpdatedDate: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

export default Admin;

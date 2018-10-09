import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { MailtoLink, Icon } from '@edx/paragon';
import { Link } from 'react-router-dom';

import H2 from '../../components/H2';
import H3 from '../../components/H3';
import Hero from '../../components/Hero';
import StatusAlert from '../../components/StatusAlert';
import LoadingMessage from '../../components/LoadingMessage';
import EnrollmentsTable from '../EnrollmentsTable';
import RegisteredLearnersTable from '../RegisteredLearnersTable';
import EnrolledLearnersTable from '../EnrolledLearnersTable';
import EnrolledLearnersForInactiveCoursesTable from '../EnrolledLearnersForInactiveCoursesTable';
import CompletedLearnersTable from '../CompletedLearnersTable';
import PastWeekPassedLearnersTable from '../PastWeekPassedLearnersTable';
import LearnerActivityTable from '../LearnerActivityTable';

import AdminCards from '../../containers/AdminCards';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

import { formatTimestamp } from '../../utils';

import './Admin.scss';

class Admin extends React.Component {
  componentDidMount() {
    const { enterpriseId } = this.props;
    if (enterpriseId) {
      this.props.getDashboardAnalytics(enterpriseId);
    }

    this.props.fetchPortalConfiguration(this.props.enterpriseSlug);
  }

  componentDidUpdate(prevProps) {
    const { enterpriseId } = this.props;
    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.props.getDashboardAnalytics(enterpriseId);
    }
  }

  getMetadataForAction(actionSlug) {
    const defaultData = {
      title: 'Full Report',
      component: <EnrollmentsTable />,
      csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
      csvButtonId: 'enrollments',
    };

    // TODO replace the component with the appropriate table component for the associated action.
    const actionData = {
      registered: {
        title: 'Registered Learners Not Yet Enrolled in a Course',
        component: <RegisteredLearnersTable />,
        csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
        csvButtonId: 'registered-learners',
      },
      enrolled: {
        title: 'Number of Courses Enrolled by Learners',
        component: <EnrolledLearnersTable />,
        csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
        csvButtonId: 'enrolled-learners',
      },
      'no-current-courses': {
        title: 'Learners Not Enrolled in an Active Course',
        description: 'Learners who have completed all of their courses and/or courses have ended.',
        component: <EnrolledLearnersForInactiveCoursesTable />,
        csvFetchMethod: EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCoursesCsv,
        csvButtonId: 'learners-with-inactive-courses',
      },
      active: {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Top Active Learners',
        component: <LearnerActivityTable id="active-week" activity="active_past_week" />,
        csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
        csvButtonId: 'learner-activity',
      },
      'inactive-week': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Week',
        component: <LearnerActivityTable id="inactive-week" activity="inactive_past_week" />,
        csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
        csvButtonId: 'inactive-enrollments',
      },
      'inactive-month': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Month',
        component: <LearnerActivityTable id="inactive-month" activity="inactive_past_month" />,
        csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
        csvButtonId: 'inactive-month-enrollments',
      },
      completed: {
        title: 'Number of Courses Completed by Learner',
        component: <CompletedLearnersTable />,
        csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
        csvButtonId: 'completed-learners',
      },
      'completed-week': {
        title: 'Number of Courses Completed by Learner',
        subtitle: 'Past Week',
        component: <PastWeekPassedLearnersTable />,
        csvFetchMethod: EnterpriseDataApiService.fetchCourseEnrollmentsCsv,
        csvButtonId: 'past-week-passed-learners',
      },
    };

    return actionData[actionSlug] || defaultData;
  }

  getCsvErrorMessage(id) {
    const { csv } = this.props;
    if (csv && csv[id] && csv[id].csvError) {
      return csv[id].csvError.message;
    }
    return '';
  }

  hasAnalyticsData() {
    const {
      activeLearners,
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
    } = this.props;

    return [activeLearners, courseCompletions, enrolledLearners, numberOfUsers]
      .some(item => item !== null);
  }

  hasEmptyData() {
    const {
      numberOfUsers,
      courseCompletions,
      enrolledLearners,
    } = this.props;

    return [courseCompletions, enrolledLearners, numberOfUsers].every(item => item === 0);
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

  renderCsvErrorMessage(message) {
    return (
      <StatusAlert
        className={['mt-3']}
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to Generate CSV Report"
        message={`Please try again. (${message})`}
      />
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="overview mt-3" />;
  }

  renderResetButton() {
    const { match: { url } } = this.props;

    // Remove the slug from the url so it renders the full report
    const path = url.split('/').slice(0, -1).join('/');

    return (
      <Link to={path} className="reset btn btn-sm btn-outline-primary ml-3">
        <span>
          <Icon className={['fa', 'fa-undo', 'mr-2']} />
          Reset to {this.getMetadataForAction().title}
        </span>
      </Link>
    );
  }

  render() {
    const {
      error,
      loading,
      enterpriseId,
      lastUpdatedDate,
      match,
    } = this.props;

    const { params: { actionSlug } } = match;
    const tableData = this.getMetadataForAction(actionSlug);
    const csvErrorMessage = this.getCsvErrorMessage(tableData.csvButtonId);

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
            </div>
          </div>
          <div className="row">
            <div className="col">
              {error && this.renderErrorMessage()}
              {loading && this.renderLoadingMessage()}
              {!loading && !error && this.hasAnalyticsData() &&
                <AdminCards />
              }
            </div>
          </div>
          <div className="row mt-4">
            <div className="col">
              <H2 className="table-title">{tableData.title}</H2>
              {actionSlug && this.renderResetButton()}
              {tableData.subtitle && <H3>{tableData.subtitle}</H3>}
              {tableData.description && <p>{tableData.description}</p>}
            </div>
          </div>
          <div className="row">
            <div className="col">
              {!error && !loading && !this.hasEmptyData() &&
                <div className="row">
                  <div className="col-12 col-md-6 pt-1 pb-3">
                    {lastUpdatedDate &&
                      <span>
                        Showing data as of {formatTimestamp({ timestamp: lastUpdatedDate })}
                      </span>
                    }
                  </div>
                  <div className="col-12 col-md-6 text-md-right">
                    <DownloadCsvButton
                      id={tableData.csvButtonId}
                      fetchMethod={tableData.csvFetchMethod}
                    />
                  </div>
                </div>
              }
              {csvErrorMessage && this.renderCsvErrorMessage(csvErrorMessage)}
              <div className="mt-3 mb-5">
                {enterpriseId && tableData.component}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <p>
                For more information, contact edX Enterprise Support at <MailtoLink to="customersuccess@edx.org" content=" customersuccess@edx.org" />.
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
  csv: null,
};

Admin.propTypes = {
  getDashboardAnalytics: PropTypes.func.isRequired,
  fetchPortalConfiguration: PropTypes.func.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
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
  csv: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      actionSlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Admin;

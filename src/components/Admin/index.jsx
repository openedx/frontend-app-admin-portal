import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { MailtoLink, Button, Icon } from '@edx/paragon';
import { Link } from 'react-router-dom';

import H2 from '../../components/H2';
import H3 from '../../components/H3';
import Hero from '../../components/Hero';
import StatusAlert from '../../components/StatusAlert';
import LoadingMessage from '../../components/LoadingMessage';
import EnrollmentsTable from '../EnrollmentsTable';
import RegisteredLearnersTable from '../RegisteredLearnersTable';
import EnrolledLearnersTable from '../EnrolledLearnersTable';
import AdminCards from '../../containers/AdminCards';

import { formatTimestamp } from '../../utils';

import './Admin.scss';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

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

    const slug = this.props.match.params.slug;
    if (slug && slug !== prevProps.match.params.slug) {
      this.props.paginateTable(
        'enrollments',
        EnterpriseDataApiService.fetchCourseEnrollments,
        this.getMetadataForAction(slug).fetchParams
      );
    }
  }

  getMetadataForAction(actionSlug) {
    const defaultData = {
      title: 'Full Report',
      component: <EnrollmentsTable />,
    };

    // TODO replace the component with the appropriate table component for the associated action.
    const actionData = {
      registered: {
        title: 'Registered Learners Not Yet Enrolled in a Course',
        component: <RegisteredLearnersTable />,
      },
      enrolled: {
        title: 'Number of Courses Enrolled by Learners',
        component: <EnrolledLearnersTable />,
      },
      unenrolled: {
        title: 'Learners Not Enrolled in an Active Course',
        description: 'Learners who have completed all of their courses and/or courses have ended.',
        component: <EnrollmentsTable />,
      },
      active: {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Top Active Learners',
        component: <EnrollmentsTable fetchParams={{learner_activity: 'active'}} />,
        fetchParams: {learner_activity: 'active_past_week'}
      },
      'inactive-week': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Week',
        component: <EnrollmentsTable />,
        fetchParams: {learner_activity: 'inactive_past_week'}
      },
      'inactive-month': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Month',
        component: <EnrollmentsTable />,
        fetchParams: {learner_activity: 'active_past_month'}
      },
      completed: {
        title: 'Number of Courses Completed by Learner',
        component: <EnrollmentsTable />,
      },
      'completed-week': {
        title: 'Number of Courses Completed by Learner',
        subtitle: 'Past Week',
        component: <EnrollmentsTable />,
        fetchParams: {passed_date: 'last_week'}
      },
    };

    return actionData[actionSlug] || defaultData;
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

  renderCsvErrorMessage() {
    return (
      <StatusAlert
        className={['mt-3']}
        alertType="danger"
        iconClassName={['fa', 'fa-times-circle']}
        title="Unable to Generate CSV Report"
        message={`Please try again. (${this.props.csvError.message})`}
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

  // TODO refactor the CSV button into a new component that accepts a fetch method
  renderDownloadCsvButton() {
    const {
      csvLoading,
      downloadCsv,
      enterpriseId,
      match,
    } = this.props;

    const { params: { slug } } = match;
    const downloadButtonIconClasses = csvLoading ? ['fa-spinner', 'fa-spin'] : ['fa-download'];

    return (
      <Button
        className={['btn-outline-primary', 'download-btn']}
        disabled={csvLoading}
        label={
          <span>
            <Icon className={['fa', 'mr-2'].concat(downloadButtonIconClasses)} />
            Download {slug ? 'current' : 'full'} report (CSV)
          </span>
        }
        onClick={() => downloadCsv(enterpriseId)}
      />
    );
  }

  render() {
    const {
      error,
      loading,
      enterpriseId,
      lastUpdatedDate,
      csvError,
      match,
    } = this.props;

    const { params: { slug } } = match;
    const tableData = this.getMetadataForAction(slug);

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
              {slug && this.renderResetButton()}
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
                    {this.renderDownloadCsvButton()}
                  </div>
                </div>
              }
              {csvError && this.renderCsvErrorMessage()}
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
  csvLoading: null,
  csvError: null,
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
  csvError: PropTypes.instanceOf(Error),
  csvLoading: PropTypes.bool,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      slug: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default Admin;

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Icon } from '@edx/paragon';
import { Link } from 'react-router-dom';
import Plot from 'react-plotly.js';

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
import DownloadCsvButton from '../../containers/DownloadCsvButton';


import AdminCards from '../../containers/AdminCards';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { formatTimestamp } from '../../utils';
import AdminSearchForm from './AdminSearchForm';

import './Admin.scss';

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grades: 'bar',
      enrollments: 'bar',
    };
  }

  componentDidMount() {
    const { enterpriseId } = this.props;
    if (enterpriseId) {
      this.props.fetchDashboardAnalytics(enterpriseId);
    }
  }

  componentDidUpdate(prevProps) {
    const { enterpriseId } = this.props;
    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.props.fetchDashboardAnalytics(enterpriseId);
    }
  }

  componentWillUnmount() {
    // Clear the overview data
    this.props.clearDashboardAnalytics();
  }

  getMetadataForAction(actionSlug) {
    const { enterpriseId } = this.props;
    const defaultData = {
      title: 'Full Report',
      component: <EnrollmentsTable />,
      csvFetchMethod: () => (
        EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, {}, { csv: true })
      ),
      csvButtonId: 'enrollments',
    };

    const actionData = {
      'registered-unenrolled-learners': {
        title: 'Registered Learners Not Yet Enrolled in a Course',
        component: <RegisteredLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchUnenrolledRegisteredLearners(
            enterpriseId,
            {},
            { csv: true },
          )
        ),
        csvButtonId: 'registered-unenrolled-learners',
      },
      'enrolled-learners': {
        title: 'Number of Courses Enrolled by Learners',
        component: <EnrolledLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchEnrolledLearners(enterpriseId, {}, { csv: true })
        ),
        csvButtonId: 'enrolled-learners',
      },
      'enrolled-learners-inactive-courses': {
        title: 'Learners Not Enrolled in an Active Course',
        description: 'Learners who have completed all of their courses and/or courses have ended.',
        component: <EnrolledLearnersForInactiveCoursesTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchEnrolledLearnersForInactiveCourses(
            enterpriseId,
            {},
            { csv: true },
          )
        ),
        csvButtonId: 'enrolled-learners-inactive-courses',
      },
      'learners-active-week': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Top Active Learners',
        component: <LearnerActivityTable id="learners-active-week" activity="active_past_week" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learner_activity: 'active_past_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-active-week',
      },
      'learners-inactive-week': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Week',
        component: <LearnerActivityTable id="learners-inactive-week" activity="inactive_past_week" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learner_activity: 'inactive_past_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-inactive-week',
      },
      'learners-inactive-month': {
        title: 'Learners Enrolled in a Course',
        subtitle: 'Not Active in Past Month',
        component: <LearnerActivityTable id="learners-inactive-month" activity="inactive_past_month" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learner_activity: 'inactive_past_month' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-inactive-month',
      },
      'completed-learners': {
        title: 'Number of Courses Completed by Learner',
        component: <CompletedLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCompletedLearners(enterpriseId, {}, { csv: true })
        ),
        csvButtonId: 'completed-learners',
      },
      'completed-learners-week': {
        title: 'Number of Courses Completed by Learner',
        subtitle: 'Past Week',
        component: <PastWeekPassedLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { passed_date: 'last_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'completed-learners-week',
      },
    };

    return actionData[actionSlug] || defaultData;
  }

  getCsvErrorMessage(id) {
    const { csv } = this.props;
    const csvData = csv && csv[id];
    return csvData && csvData.csvError;
  }

  getTableData(id = 'enrollments') {
    const { table } = this.props;
    const tableData = table && table[id];
    return tableData && tableData.data;
  }

  displaySearchBar() {
    return !this.props.match.params.actionSlug;
  }

  isTableDataMissing(id) {
    const tableData = this.getTableData(id);
    if (!tableData) {
      return true;
    }
    const isTableLoading = tableData.loading;
    const isTableEmpty = tableData.results && !tableData.results.length;
    return isTableLoading || isTableEmpty;
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

  handleClickEnrollment = (e) => {
    this.setState({ enrollments: e.target.id }, () => {
    });
  }

  handleClickGrades = (e) => {
    this.setState({ grades: e.target.id }, () => {
    });
  }

  renderDownloadButton() {
    const { match } = this.props;
    const { params: { actionSlug } } = match;
    const tableMetadata = this.getMetadataForAction(actionSlug);
    return (
      <DownloadCsvButton
        id={tableMetadata.csvButtonId}
        fetchMethod={tableMetadata.csvFetchMethod}
        disabled={this.isTableDataMissing(actionSlug)}
        buttonLabel={`Download ${actionSlug ? 'current' : 'full'} report (CSV)`}
      />
    );
  }

  renderResetButton() {
    const { match: { url } } = this.props;

    // Remove the slug from the url so it renders the full report
    const path = url.split('/').slice(0, -1).join('/');

    return (
      <Link to={path} className="reset btn btn-sm btn-outline-primary ml-3">
        <Icon className="fa fa-undo mr-2" />
        Reset to {this.getMetadataForAction().title}
      </Link>
    );
  }

  renderErrorMessage() {
    return (
      <StatusAlert
        alertType="danger"
        iconClassName="fa fa-times-circle"
        title="Unable to load overview"
        message={`Try refreshing your screen (${this.props.error.message})`}
      />
    );
  }

  renderCsvErrorMessage(message) {
    return (
      <StatusAlert
        className="mt-3"
        alertType="danger"
        iconClassName="fa fa-times-circle"
        title="Unable to Generate CSV Report"
        message={`Please try again. (${message})`}
      />
    );
  }

  renderLoadingMessage() {
    return <LoadingMessage className="overview mt-3" />;
  }

  render() {
    const {
      error,
      lastUpdatedDate,
      loading,
      enterpriseId,
      match,
    } = this.props;

    const { params: { actionSlug } } = match;
    const tableMetadata = this.getMetadataForAction(actionSlug);
    const csvErrorMessage = this.getCsvErrorMessage(tableMetadata.csvButtonId);

    return (
      <React.Fragment>
        {!loading && !error && !this.hasAnalyticsData() ? this.renderLoadingMessage() : (
          <React.Fragment>
            <main role="main">
              <Helmet title="Learner Progress Report" />
              <Hero title="Learner Progress Report" />
              <div className="container-fluid">
                <div className="row mt-4">
                  <div className="col">
                    <div className="row">
                      <div className="col-12 col-md-12 col-lg-12 col-xl-6 pt-1 pb-3">
                        <Plot
                          data={[
                            {
                              x: ['01/01/20', '07/01/20', '14/01/20', '21/01/20', '31/01/20',
                                '01/02/20', '07/02/20', '14/02/20', '21/02/20', '28/02/20',
                                '01/03/20', '07/03/20', '14/03/20', '21/03/20', '31/03/20'],
                              y: [10, 4, 33, 1, 14, 23, 11, 17, 43, 21, 12, 25, 27, 16, 38],
                              type: this.state.enrollments,
                              marker: {
                                color: 'rgba(255,153,51,0.6)',
                                width: 1,
                              },
                            },
                          ]}
                          layout={{ title: 'Week Wise Enrollments' }}
                        />
                        <button className="request-codes-btn btn btn-primary" onClick={this.handleClickEnrollment} id="scatter">Select Scatter</button>
                        <button className="request-codes-btn btn btn-primary" onClick={this.handleClickEnrollment} id="bar">Select Bar</button>
                      </div>
                      <div className="col-12 col-md-12 col-lg-12 col-xl-4 pt-1 pb-3">
                        <Plot
                          data={[
                            {
                              values: [19, 26],
                              labels: ['In-Progress', 'Completed'],
                              type: 'pie',
                            },
                          ]}
                          layout={{ width: 420, height: 380, title: 'In-Progress and Completed' }}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-12 col-lg-12 col-xl-6 pt-1 pb-3">
                        <Plot
                          data={[
                            {
                              x: [13, 11, 8, 5],
                              y: [0, 0.2, 0.85, 1],
                              orientation: 'h',
                              type: this.state.grades,

                            },
                          ]}
                          layout={{ title: 'Grades Distribution' }}
                        />
                        <button className="request-codes-btn btn btn-primary" onClick={this.handleClickGrades} id="scatter">Select Scatter</button>
                        <button className="request-codes-btn btn btn-primary" onClick={this.handleClickGrades} id="funnel">Select Funnel</button>
                        <button className="request-codes-btn btn btn-primary" onClick={this.handleClickGrades} id="bar">Select Bar</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col">
                    <div className="row" />
                  </div>
                </div>
                <div className="row mt-4">
                  <div className="col">
                    <H2>Overview</H2>
                  </div>
                </div>
                <div className="row mt-3">
                  {(error || loading) ? (
                    <div className="col">
                      {error && this.renderErrorMessage()}
                      {loading && this.renderLoadingMessage()}
                    </div>
                  ) : (
                    <AdminCards />
                  )}
                </div>
                <div className="row mt-4">
                  <div className="col">
                    <H2 className="table-title">{tableMetadata.title}</H2>
                    {actionSlug && this.renderResetButton()}
                    {tableMetadata.subtitle && <H3>{tableMetadata.subtitle}</H3>}
                    {tableMetadata.description && <p>{tableMetadata.description}</p>}
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    {!error && !loading && !this.hasEmptyData() && (
                      <React.Fragment>
                        <div className="row pb-3">
                          <div className="col-12 col-md-6  col-xl-4 pt-1 pb-3">
                            {lastUpdatedDate &&
                              <React.Fragment>
                                Showing data as of {formatTimestamp({ timestamp: lastUpdatedDate })}
                              </React.Fragment>
                            }

                          </div>
                          <div className="col-12 col-md-6 col-xl-8">
                            {this.renderDownloadButton()}
                          </div>
                        </div>
                        {this.displaySearchBar() && <AdminSearchForm
                          match={this.props.match}
                          location={this.props.location}
                          csv={this.props.csv}
                          searchEnrollmentsList={() => this.props.searchEnrollmentsList()}
                          tableData={this.getTableData() ? this.getTableData().results : []}
                        />}
                      </React.Fragment>
                    )}
                    {csvErrorMessage && this.renderCsvErrorMessage(csvErrorMessage)}
                    <div className="mt-3 mb-5">
                      {enterpriseId && tableMetadata.component}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </React.Fragment>
        )}
      </React.Fragment>
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
  location: {
    search: null,
  },
  csv: null,
  table: null,
};

Admin.propTypes = {
  fetchDashboardAnalytics: PropTypes.func.isRequired,
  clearDashboardAnalytics: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string,
  searchEnrollmentsList: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
  }),
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
  csv: PropTypes.shape({}),
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    params: PropTypes.shape({
      actionSlug: PropTypes.string,
    }).isRequired,
  }).isRequired,
  table: PropTypes.shape({}),
};

export default Admin;

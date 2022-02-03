import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Icon } from '@edx/paragon';
import { Link } from 'react-router-dom';

import Hero from '../Hero';
import StatusAlert from '../StatusAlert';
import EnrollmentsTable from '../EnrollmentsTable';
import RegisteredLearnersTable from '../RegisteredLearnersTable';
import EnrolledLearnersTable from '../EnrolledLearnersTable';
import EnrolledLearnersForInactiveCoursesTable from '../EnrolledLearnersForInactiveCoursesTable';
import CompletedLearnersTable from '../CompletedLearnersTable';
import PastWeekPassedLearnersTable from '../PastWeekPassedLearnersTable';
import LearnerActivityTable from '../LearnerActivityTable';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import AdminCards from '../../containers/AdminCards';
import AdminSearchForm from './AdminSearchForm';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';

import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { formatTimestamp } from '../../utils';

import AdminCardsSkeleton from './AdminCardsSkeleton';

class Admin extends React.Component {
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

  renderUrlResetButton() {
    const { match: { url } } = this.props;

    // Remove the slug from the url so it renders the full report
    const path = url.split('/').slice(0, -1).join('/');

    return (
      <Link to={path} className="btn btn-sm btn-outline-primary ml-0 ml-md-3 mr-3">
        <Icon className="fa fa-undo mr-2" />
        Reset to {this.getMetadataForAction().title}
      </Link>
    );
  }

  renderFiltersResetButton() {
    const { location: { search, pathname } } = this.props;
    // remove the querys from the path
    const queryParams = new URLSearchParams(search);
    ['search', 'search_course', 'search_start_date'].forEach((searchTerm) => {
      queryParams.delete(searchTerm);
    });
    const resetQuery = queryParams.toString();
    const resetLink = resetQuery ? `${pathname}?${resetQuery}` : pathname;
    return (
      <Link id="reset-filters" to={resetLink} className="btn btn-sm btn-outline-primary">
        <Icon className="fa fa-undo mr-2" />
        Reset Filters
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

  render() {
    const {
      error,
      lastUpdatedDate,
      loading,
      enterpriseId,
      match,
      location: { search },
    } = this.props;

    const { params: { actionSlug } } = match;
    const filtersActive = search;
    const tableMetadata = this.getMetadataForAction(actionSlug);
    const csvErrorMessage = this.getCsvErrorMessage(tableMetadata.csvButtonId);
    const queryParams = new URLSearchParams(search);
    const searchParams = {
      searchQuery: queryParams.get('search') || '',
      searchCourseQuery: queryParams.get('search_course') || '',
      searchDateQuery: queryParams.get('search_start_date') || '',
    };

    return (
      <main role="main" className="learner-progress-report">
        {!loading && !error && !this.hasAnalyticsData() ? <EnterpriseAppSkeleton /> : (
          <>
            <Helmet title="Learner Progress Report" />
            <Hero title="Learner Progress Report" />
            <div className="container-fluid">
              <div className="row mt-4">
                <div className="col">
                  <h2>Overview</h2>
                </div>
              </div>
              <div className="row mt-3">
                {(error || loading) ? (
                  <div className="col">
                    {error && this.renderErrorMessage()}
                    {loading && <AdminCardsSkeleton />}
                  </div>
                ) : (
                  <AdminCards />
                )}
              </div>
              <div className="row mt-4">
                <div className="col">
                  <div className="row">
                    <div className="col-12 col-md-3 col-xl-2 mb-2 mb-md-0">
                      <h2 className="table-title">{tableMetadata.title}</h2>
                    </div>
                    <div className="col-12 col-md-9 col-xl-10 mb-2 mb-md-0 mt-0 mt-md-1">
                      {actionSlug && this.renderUrlResetButton()}
                      {filtersActive && this.renderFiltersResetButton()}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      {tableMetadata.subtitle && <h3>{tableMetadata.subtitle}</h3>}
                      {tableMetadata.description && <p>{tableMetadata.description}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  {!error && !loading && !this.hasEmptyData() && (
                    <>
                      <div className="row pb-3">
                        <div className="col-12 col-md-6  col-xl-4 pt-1 pb-3">
                          {lastUpdatedDate
                            && (
                            <>
                              Showing data as of {formatTimestamp({ timestamp: lastUpdatedDate })}
                            </>
                            )}

                        </div>
                        <div className="col-12 col-md-6 col-xl-8">
                          {this.renderDownloadButton()}
                        </div>
                      </div>
                      {this.displaySearchBar() && (
                      <AdminSearchForm
                        searchParams={searchParams}
                        searchEnrollmentsList={() => this.props.searchEnrollmentsList()}
                        tableData={this.getTableData() ? this.getTableData().results : []}
                      />
                      )}
                    </>
                  )}
                  {csvErrorMessage && this.renderCsvErrorMessage(csvErrorMessage)}
                  <div className="mt-3 mb-5">
                    {enterpriseId && tableMetadata.component}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
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
    pathname: PropTypes.string,
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

import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import {
  Alert, Icon, Tab, Tabs,
} from '@openedx/paragon';
import { Error, Undo } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';
import {
  FormattedDate, FormattedMessage, injectIntl, intlShape,
} from '@edx/frontend-platform/i18n';

import Hero from '../Hero';
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
import { SubscriptionData } from '../subscriptions';
import EmbeddedSubscription from './EmbeddedSubscription';
import { withLocation, withParams } from '../../hoc';
import AIAnalyticsSummary from './AIAnalyticsSummary';
import AIAnalyticsSummarySkeleton from './AIAnalyticsSummarySkeleton';
import BudgetExpiryAlertAndModal from '../BudgetExpiryAlertAndModal';
import ModuleActivityReport from './tabs/ModuleActivityReport';

class Admin extends React.Component {
  constructor(props) {
    super();

    this.fullReportRef = createRef();
    const state = {
      activeTab: 'learner-progress-report',
    };

    // Prepare to scroll to report section when it loads
    if (props?.location?.hash === '#fullreport') {
      state.navigateToReport = true;
    }

    this.state = state;
  }

  componentDidMount() {
    const { enterpriseId } = this.props;
    if (enterpriseId) {
      this.props.fetchDashboardAnalytics(enterpriseId);
      this.props.fetchDashboardInsights(enterpriseId);
      this.props.fetchEnterpriseBudgets(enterpriseId);
      this.props.fetchEnterpriseGroups(enterpriseId);
    }
  }

  componentDidUpdate(prevProps) {
    const element = this.fullReportRef.current;
    // Scroll to report section if #fullreport in url
    if (element && this.state.navigateToReport) {
      element.scrollIntoView();
      this.setState({ navigateToReport: false });
    }
    const { enterpriseId } = this.props;
    if (enterpriseId && enterpriseId !== prevProps.enterpriseId) {
      this.props.fetchDashboardAnalytics(enterpriseId);
      this.props.fetchDashboardInsights(enterpriseId);
      this.props.fetchEnterpriseBudgets(enterpriseId);
      this.props.fetchEnterpriseGroups(enterpriseId);
    }
  }

  componentWillUnmount() {
    // Clear the overview data
    this.props.clearDashboardAnalytics();
    this.props.clearDashboardInsights();
    this.props.clearEnterpriseBudgets();
    this.props.clearEnterpriseGroups();
  }

  getMetadataForAction(actionSlug) {
    const { enterpriseId, intl } = this.props;
    const defaultData = {
      title: intl.formatMessage({
        id: 'admin.portal.lpr.report.full.report.title',
        defaultMessage: 'Full Report',
        description: 'Title for full report',
      }),
      component: <EnrollmentsTable />,
      csvFetchMethod: () => (
        EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, {}, { csv: true })
      ),
      csvButtonId: 'enrollments',
    };

    const actionData = {
      'registered-unenrolled-learners': {
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.registered.learners.not.enrolled.title',
          defaultMessage: 'Registered Learners Not Yet Enrolled in a Course',
          description: 'Report title for registered learners not yet enrolled in a course',
        }),
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
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.enrolled.learners.title',
          defaultMessage: 'Number of Courses Enrolled by Learners',
          description: 'Report title for number of courses enrolled by learners',
        }),
        component: <EnrolledLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchEnrolledLearners(enterpriseId, {}, { csv: true })
        ),
        csvButtonId: 'enrolled-learners',
      },
      'enrolled-learners-inactive-courses': {
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.not.enrolled.in.active.course.title',
          defaultMessage: 'Learners Not Enrolled in an Active Course',
          description: 'Report title for learners not enrolled in an active course',
        }),
        description: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.not.enrolled.in.active.course.description',
          defaultMessage: 'Learners who have completed all of their courses and/or courses have ended.',
          description: 'Report description for learners not enrolled in an active course',
        }),
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
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.active.week.title',
          defaultMessage: 'Learners Enrolled in a Course',
          description: 'Report title for learners active in the past week',
        }),
        subtitle: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.active.week.subtitle',
          defaultMessage: 'Top Active Learners',
          description: 'Report subtitle for learners active in the past week',
        }),
        component: <LearnerActivityTable id="learners-active-week" activity="active_past_week" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learnerActivity: 'active_past_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-active-week',
      },
      'learners-inactive-week': {
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.inactive.week.title',
          defaultMessage: 'Learners Enrolled in a Course',
          description: 'Report title for learners inactive in the past week',
        }),
        subtitle: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.inactive.week.subtitle',
          defaultMessage: 'Not Active in Past Week',
          description: 'Report subtitle for learners inactive in the past week',
        }),
        component: <LearnerActivityTable id="learners-inactive-week" activity="inactive_past_week" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learnerActivity: 'inactive_past_week' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-inactive-week',
      },
      'learners-inactive-month': {
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.inactive.month.title',
          defaultMessage: 'Learners Enrolled in a Course',
          description: 'Report title for learners inactive in the past month',
        }),
        subtitle: intl.formatMessage({
          id: 'admin.portal.lpr.report.learners.inactive.month.subtitle',
          defaultMessage: 'Not Active in Past Month',
          description: 'Report subtitle for learners inactive in the past month',
        }),
        component: <LearnerActivityTable id="learners-inactive-month" activity="inactive_past_month" />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { learnerActivity: 'inactive_past_month' },
            { csv: true },
          )
        ),
        csvButtonId: 'learners-inactive-month',
      },
      'completed-learners': {
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.completed.learners.title',
          defaultMessage: 'Number of Courses Completed by Learner',
          description: 'Report title for number of courses completed by learners',
        }),
        component: <CompletedLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCompletedLearners(enterpriseId, {}, { csv: true })
        ),
        csvButtonId: 'completed-learners',
      },
      'completed-learners-week': {
        title: intl.formatMessage({
          id: 'admin.portal.lpr.report.completed.learners.past.week.title',
          defaultMessage: 'Number of Courses Completed by Learner',
          description: 'Report title for number of courses completed by learners in past week',
        }),
        subtitle: intl.formatMessage({
          id: 'admin.portal.lpr.report.completed.learners.past.week.subtitle',
          defaultMessage: 'Past Week',
          description: 'Report title for number of courses completed by learners in past week',
        }),
        component: <PastWeekPassedLearnersTable />,
        csvFetchMethod: () => (
          EnterpriseDataApiService.fetchCourseEnrollments(
            enterpriseId,
            { passedDate: 'last_week' },
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
    return !this.props.actionSlug;
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
    const { actionSlug, intl } = this.props;
    const tableMetadata = this.getMetadataForAction(actionSlug);
    let downloadButtonLabel;
    if (actionSlug) {
      downloadButtonLabel = intl.formatMessage({
        id: 'admin.portal.lpr.current.report.csv.download',
        defaultMessage: 'Download current report (CSV)',
        description: 'Download button label for current report',
      });
    }

    return (
      <DownloadCsvButton
        id={tableMetadata.csvButtonId}
        fetchMethod={tableMetadata.csvFetchMethod}
        disabled={this.isTableDataMissing(actionSlug)}
        buttonLabel={downloadButtonLabel}
      />
    );
  }

  renderUrlResetButton() {
    const url = this.props.location.pathname;

    // Remove the slug from the url so it renders the full report
    const path = url.split('/').slice(0, -1).join('/');

    return (
      <Link to={path} className="btn btn-sm btn-outline-primary ml-0 ml-md-3 mr-3">
        <Icon src={Undo} className="mr-2" />
        <FormattedMessage
          id="admin.portal.lpr.reset.report.button.label"
          defaultMessage="Reset to Full Report"
          description="Label for button that upon click will reset the report to full report"
        />
      </Link>
    );
  }

  renderFiltersResetButton() {
    const { location: { search, pathname } } = this.props;
    // remove the querys from the path
    const queryParams = new URLSearchParams(search);
    ['search', 'search_course', 'search_start_date', 'budget_uuid', 'group_uuid'].forEach((searchTerm) => {
      queryParams.delete(searchTerm);
    });
    const resetQuery = queryParams.toString();
    const resetLink = resetQuery ? `${pathname}?${resetQuery}` : pathname;
    return (
      <Link id="reset-filters" to={resetLink} className="btn btn-sm btn-outline-primary">
        <Icon src={Undo} className="mr-2" />
        <FormattedMessage
          id="admin.portal.lpr.reset.filters.button.label"
          defaultMessage="Reset Filters"
          description="Label for button that upon click will reset the filters to default"
        />
      </Link>
    );
  }

  renderErrorMessage() {
    return (
      <Alert
        variant="danger"
        icon={Error}
      >
        <Alert.Heading>
          <FormattedMessage
            id="admin.portal.lpr.error.message.heading"
            defaultMessage="Hey, nice to see you"
            description="Error message heading for learner progress report page"
          />
        </Alert.Heading>
        <p>
          <FormattedMessage
            id="admin.portal.lpr.error.message.detail"
            defaultMessage="Try refreshing your screen {errorDetail}"
            description="Error message detail for learner progress report page"
            values={{ errorDetail: this.props.error.message }}
          />
        </p>
      </Alert>
    );
  }

  renderCsvErrorMessage(message) {
    return (
      <Alert
        variant="danger"
        className="mt-3"
        icon={Error}
      >
        <Alert.Heading>
          <FormattedMessage
            id="admin.portal.lpr.error.csv.generation.heading"
            defaultMessage="Unable to generate CSV report"
            description="Error message heading for CSV report generation failure"
          />
        </Alert.Heading>
        <p>
          <FormattedMessage
            id="admin.portal.lpr.error.csv.generation.detail"
            defaultMessage="Please try again. {message}"
            description="Error message detail for CSV report generation failure"
            values={{ message }}
          />
        </p>
      </Alert>
    );
  }

  renderOverviewHeading() {
    return (
      <h2>
        <FormattedMessage
          id="admin.portal.lpr.overview.heading"
          defaultMessage="Overview"
          description="Heading for the overview section of the learner progress report page"
        />
      </h2>
    );
  }

  render() {
    const {
      error,
      lastUpdatedDate,
      loading,
      enterpriseId,
      actionSlug,
      location: { search },
      insights,
      insightsLoading,
      intl,
      budgets,
      groups,
    } = this.props;
    const { activeTab } = this.state;

    const queryParams = new URLSearchParams(search || '');
    const queryParamsLength = Array.from(queryParams.entries()).length;
    const filtersActive = queryParamsLength !== 0 && !(queryParamsLength === 1 && queryParams.has('ordering'));
    const tableMetadata = this.getMetadataForAction(actionSlug);
    const csvErrorMessage = this.getCsvErrorMessage(tableMetadata.csvButtonId);

    const searchParams = {
      searchQuery: queryParams.get('search') || '',
      searchCourseQuery: queryParams.get('search_course') || '',
      searchDateQuery: queryParams.get('search_start_date') || '',
      searchBudgetQuery: queryParams.get('budget_uuid') || '',
      searchGroupQuery: queryParams.get('group_uuid') || '',
    };

    const hasCompleteInsights = insights?.learner_engagement && insights?.learner_progress;

    return (
      <main role="main" className="learner-progress-report">
        {!loading && !error && !this.hasAnalyticsData() ? <EnterpriseAppSkeleton /> : (
          <>
            <Helmet title="Learner Progress Report" />
            <Hero title="Learner Progress Report" />
            <div className="container-fluid">
              <div className="row mt-4">
                <div className="col">
                  <BudgetExpiryAlertAndModal />
                </div>
              </div>
              <div className="row mt-4">
                <div className="col">
                  {insightsLoading ? <AIAnalyticsSummarySkeleton renderOverviewHeading={this.renderOverviewHeading} />
                    : (
                      hasCompleteInsights && (
                        <AIAnalyticsSummary
                          enterpriseId={enterpriseId}
                          renderOverviewHeading={this.renderOverviewHeading}
                        />
                      )
                    )}
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

              <div className="row">
                <div className="col mb-4.5">
                  <SubscriptionData enterpriseId={enterpriseId}>
                    <EmbeddedSubscription />
                  </SubscriptionData>
                </div>
              </div>

              <div className="row mt-4" id="learner-progress-report">
                <div className="col">
                  <div className="row">
                    <div className="col-12 col-md-3 col-xl-2 mb-2 mb-md-0">
                      <h2 className="table-title" ref={this.fullReportRef}>{tableMetadata.title}</h2>
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

              <div className="tabs-container">
                <div className="col-12 col-md-6  col-xl-4 pt-1 pb-3">
                  {lastUpdatedDate
                    && (
                      <FormattedMessage
                        id="admin.portal.lpr.data.refreshed.date.message"
                        defaultMessage="Showing data as of {timestamp}"
                        description="Message to show the last updated date of the data on lpr page"
                        values={{
                          timestamp: <FormattedDate
                            value={formatTimestamp({ timestamp: lastUpdatedDate })}
                            year="numeric"
                            month="long"
                            day="numeric"
                          />,
                        }}
                      />
                    )}
                </div>
                <Tabs
                  variant="tabs"
                  activeKey={activeTab}
                  onSelect={(tab) => {
                    this.setState({ activeTab: tab });
                  }}
                >
                  <Tab
                    eventKey="learner-progress-report"
                    title={intl.formatMessage({
                      id: 'adminPortal.lpr.tab.learnerProgressReport.title',
                      defaultMessage: 'Learner Progress Report',
                      description: 'Title for the learner progress report tab in admin portal.',
                    })}
                  >
                    <div className="row">
                      <div className="col">
                        {!error && !loading && !this.hasEmptyData() && (
                          <>
                            <div className="row pb-3 mt-2">
                              <div className="col-12 col-md-12 col-xl-12">
                                {this.renderDownloadButton()}
                              </div>
                            </div>
                            {this.displaySearchBar() && (
                              <AdminSearchForm
                                searchParams={searchParams}
                                searchEnrollmentsList={() => this.props.searchEnrollmentsList()}
                                tableData={this.getTableData() ? this.getTableData().results : []}
                                budgets={budgets}
                                groups={groups}
                                enterpriseId={enterpriseId}
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
                  </Tab>
                  <Tab
                    eventKey="module-activity"
                    title={intl.formatMessage({
                      id: 'adminPortal.lpr.tab.moduleActivity.title',
                      defaultMessage: 'Module Activity (Executive Education)',
                      description: 'Title for the module activity tab in admin portal.',
                    })}
                  >
                    <div className="mt-3">
                      <ModuleActivityReport enterpriseId={enterpriseId} />
                    </div>
                  </Tab>
                </Tabs>
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
  insightsLoading: false,
  insights: null,
  budgets: [],
  groups: [],
};

Admin.propTypes = {
  fetchDashboardAnalytics: PropTypes.func.isRequired,
  clearDashboardAnalytics: PropTypes.func.isRequired,
  fetchDashboardInsights: PropTypes.func.isRequired,
  clearDashboardInsights: PropTypes.func.isRequired,
  fetchEnterpriseBudgets: PropTypes.func.isRequired,
  clearEnterpriseBudgets: PropTypes.func.isRequired,
  fetchEnterpriseGroups: PropTypes.func.isRequired,
  clearEnterpriseGroups: PropTypes.func.isRequired,
  enterpriseId: PropTypes.string,
  searchEnrollmentsList: PropTypes.func.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string,
    hash: PropTypes.string,
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
  actionSlug: PropTypes.string,
  table: PropTypes.shape({}),
  budgets: PropTypes.arrayOf(PropTypes.shape({})),
  groups: PropTypes.arrayOf(PropTypes.shape({})),
  insightsLoading: PropTypes.bool,
  insights: PropTypes.objectOf(PropTypes.shape),
  // injected
  intl: intlShape.isRequired,
};

export default withParams(withLocation(injectIntl(Admin)));

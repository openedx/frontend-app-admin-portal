import { FormattedDate, FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import {
  Alert, Icon, Tab, Tabs,
} from '@openedx/paragon';
import { Error, Undo } from '@openedx/paragon/icons';
import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import AdminCards from '../../containers/AdminCards';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import CompletedLearnersTable from '../CompletedLearnersTable';
import EnrolledLearnersForInactiveCoursesTable from '../EnrolledLearnersForInactiveCoursesTable';
import EnrolledLearnersTable from '../EnrolledLearnersTable';
import EnrollmentsTable from '../EnrollmentsTable';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import Hero from '../Hero';
import LearnerActivityTable from '../LearnerActivityTable';
import PastWeekPassedLearnersTable from '../PastWeekPassedLearnersTable';
import { TRACK_LEARNER_PROGRESS_TARGETS } from '../ProductTours/AdminOnboardingTours/constants';
import RegisteredLearnersTable from '../RegisteredLearnersTable';
import AdminSearchForm from './AdminSearchForm';

import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { formatTimestamp, getFilteredQueryParams } from '../../utils';

import { withLocation, withParams } from '../../hoc';
import BudgetExpiryAlertAndModal from '../BudgetExpiryAlertAndModal';
import { SubscriptionData } from '../subscriptions';
import AdminCardsSkeleton from './AdminCardsSkeleton';
import AIAnalyticsSummary from './AIAnalyticsSummary';
import AIAnalyticsSummarySkeleton from './AIAnalyticsSummarySkeleton';
import EmbeddedSubscription from './EmbeddedSubscription';
import ModuleActivityReport from './tabs/ModuleActivityReport';

const Admin = ({
  fetchDashboardAnalytics,
  clearDashboardAnalytics,
  fetchDashboardInsights,
  clearDashboardInsights,
  fetchEnterpriseBudgets,
  clearEnterpriseBudgets,
  fetchEnterpriseGroups,
  clearEnterpriseGroups,
  searchEnrollmentsList,
  enterpriseId,
  location,
  activeLearners,
  enrolledLearners,
  numberOfUsers,
  courseCompletions,
  lastUpdatedDate,
  loading,
  error,
  csv,
  actionSlug,
  table,
  budgets,
  groups,
  insightsLoading,
  insights,
}) => {
  const intl = useIntl();
  const fullReportRef = useRef();
  const [activeTab, setActiveTab] = useState('learner-progress-report');
  const [ModuleActivityReportVisible, setModuleActivityReportVisible] = useState(false);
  const [navigateToReport, setNavigateToReport] = useState(location?.hash === '#fullreport');

  const showModularActivityReport = (enterpriseIdParam) => {
    const filters = {};
    EnterpriseDataApiService.fetchEnterpriseModuleActivityReport(enterpriseIdParam, {
      search: '',
      ...filters,
    })
      .then((response) => {
        if (response?.data?.results?.length > 0) {
          setModuleActivityReportVisible(true);
        }
      })
      .catch((errorResponse) => {
        logError('Error fetching module activity report', errorResponse);
        setModuleActivityReportVisible(false);
      });
  };

  useEffect(() => {
    if (enterpriseId) {
      fetchDashboardAnalytics(enterpriseId);
      fetchDashboardInsights(enterpriseId);
      fetchEnterpriseBudgets(enterpriseId);
      fetchEnterpriseGroups(enterpriseId);
      showModularActivityReport(enterpriseId);
    }
  }, [enterpriseId, fetchDashboardAnalytics, fetchDashboardInsights, fetchEnterpriseBudgets, fetchEnterpriseGroups]);

  useEffect(() => {
    const element = fullReportRef.current;
    // Scroll to report section if #fullreport in url
    if (element && navigateToReport) {
      element.scrollIntoView();
      setNavigateToReport(false);
    }
  }, [navigateToReport]);

  useEffect(() => () => {
    // Clear the overview data
    clearDashboardAnalytics();
    clearDashboardInsights();
    clearEnterpriseBudgets();
    clearEnterpriseGroups();
  }, [clearDashboardAnalytics, clearDashboardInsights, clearEnterpriseBudgets, clearEnterpriseGroups]);

  const getMetadataForAction = (actionSlugParam) => {
    const expectedQueryParams = ['search', 'search_course', 'search_start_date', 'budget_uuid', 'group_uuid'];
    const filteredQueryParams = getFilteredQueryParams(location.search, expectedQueryParams);

    const defaultData = {
      title: intl.formatMessage({
        id: 'admin.portal.lpr.report.full.report.title',
        defaultMessage: 'Full Report',
        description: 'Title for full report',
      }),
      component: <EnrollmentsTable />,
      csvFetchMethod: () => (
        EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, filteredQueryParams, { csv: true })
      ),
      csvButtonId: 'enrollments',
      hasActiveFilters: !isEmpty(filteredQueryParams),
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

    return actionData[actionSlugParam] || defaultData;
  };

  const getCsvErrorMessage = (id) => {
    const csvData = csv && csv[id];
    return csvData && csvData.csvError;
  };

  const getTableData = (id = 'enrollments') => {
    const tableData = table && table[id];
    return tableData && tableData.data;
  };

  const displaySearchBar = () => !actionSlug;

  const isTableDataMissing = (id) => {
    const tableData = getTableData(id);
    if (!tableData) {
      return true;
    }
    const isTableLoading = tableData.loading;
    const isTableEmpty = tableData.results && !tableData.results.length;
    return isTableLoading || isTableEmpty;
  };

  const hasAnalyticsData = () => [activeLearners, courseCompletions, enrolledLearners, numberOfUsers]
    .some(item => item !== null);

  const hasEmptyData = () => [courseCompletions, enrolledLearners, numberOfUsers].every(item => item === 0);

  const renderDownloadButton = () => {
    const tableMetadata = getMetadataForAction(actionSlug);
    let downloadButtonLabel;
    if (actionSlug || tableMetadata.hasActiveFilters) {
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
        disabled={isTableDataMissing(actionSlug)}
        buttonLabel={downloadButtonLabel}
      />
    );
  };

  const renderUrlResetButton = () => {
    const url = location.pathname;

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
  };

  const renderFiltersResetButton = () => {
    const { search, pathname } = location;
    // remove the querys from the path
    const queryParams = new URLSearchParams(search);
    ['search', 'search_course', 'search_start_date', 'budget_uuid', 'group_uuid'].forEach((searchTerm) => {
      queryParams.delete(searchTerm);
    });
    const resetQuery = queryParams.toString();
    const resetLink = resetQuery ? `${pathname}?${resetQuery}` : pathname;
    return (
      <Link data-testid="reset-filters" id="reset-filters" to={resetLink} className="btn btn-sm btn-outline-primary">
        <Icon src={Undo} className="mr-2" />
        <FormattedMessage
          id="admin.portal.lpr.reset.filters.button.label"
          defaultMessage="Reset Filters"
          description="Label for button that upon click will reset the filters to default"
        />
      </Link>
    );
  };

  const renderErrorMessage = () => (
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
          values={{ errorDetail: error.message }}
        />
      </p>
    </Alert>
  );

  const renderCsvErrorMessage = (message) => (
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

  const queryParams = new URLSearchParams(location.search || '');
  const queryParamsLength = Array.from(queryParams.entries()).length;
  const filtersActive = queryParamsLength !== 0 && !(queryParamsLength === 1 && queryParams.has('ordering'));
  const tableMetadata = getMetadataForAction(actionSlug);
  const csvErrorMessage = getCsvErrorMessage(tableMetadata.csvButtonId);

  const searchParams = {
    searchQuery: queryParams.get('search') || '',
    searchCourseQuery: queryParams.get('search_course') || '',
    searchDateQuery: queryParams.get('search_start_date') || '',
    searchBudgetQuery: queryParams.get('budget_uuid') || '',
    searchGroupQuery: queryParams.get('group_uuid') || '',
  };

  const hasCompleteInsights = insights?.learner_engagement && insights?.learner_progress;

  return (
    <main data-enterprise-id={enterpriseId} data-testid="dashboard-root" role="main" className="learner-progress-report">
      {!loading && !error && !hasAnalyticsData() ? <EnterpriseAppSkeleton /> : (
        <>
          <Helmet title="Learner Progress Report" />
          <Hero title="Learner Progress Report" />
          <div className="container-fluid">
            <div id={TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}>
              <div className="row mt-4">
                <div className="col">
                  <BudgetExpiryAlertAndModal />
                  <h2>
                    <FormattedMessage
                      id="admin.portal.lpr.overview.heading"
                      defaultMessage="Overview"
                      description="Heading for the overview section of the learner progress report page"
                    />
                  </h2>
                </div>
              </div>
              <div className="row mt-4">
                <div id={TRACK_LEARNER_PROGRESS_TARGETS.AI_SUMMARY} className="col">
                  {insightsLoading ? <AIAnalyticsSummarySkeleton /> : (
                    hasCompleteInsights && <AIAnalyticsSummary enterpriseId={enterpriseId} />
                  )}
                </div>
              </div>
              <div className="row mt-3">
                {(error || loading) ? (
                  <div className="col">
                    {error && renderErrorMessage()}
                    {loading && <AdminCardsSkeleton />}
                  </div>
                ) : (
                  <AdminCards />
                )}
              </div>
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
                    <h2 className="table-title" ref={fullReportRef}>{tableMetadata.title}</h2>
                  </div>
                  <div className="col-12 col-md-9 col-xl-10 mb-2 mb-md-0 mt-0 mt-md-1">
                    {actionSlug && renderUrlResetButton()}
                    {filtersActive && renderFiltersResetButton()}
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

            <div className="tabs-container" id={TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}>
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
                  setActiveTab(tab);
                }}
              >
                <Tab
                  eventKey="learner-progress-report"
                  title={intl.formatMessage({
                    id: 'adminPortal.lpr.tab.learnerProgressReport.title',
                    defaultMessage: 'Learner Progress Report',
                    description: 'Title for the learner progress report tab in admin portal.',
                  })}
                  id={TRACK_LEARNER_PROGRESS_TARGETS.FULL_PROGRESS_REPORT}
                >
                  <div className="row">
                    <div className="col">
                      {!error && !loading && !hasEmptyData() && (
                        <>
                          <div className="row pb-3 mt-2">
                            <div className="col-12 col-md-12 col-xl-12">
                              {renderDownloadButton()}
                            </div>
                          </div>
                          <span id={TRACK_LEARNER_PROGRESS_TARGETS.FILTER}>
                            {displaySearchBar() && (
                              <AdminSearchForm
                                searchParams={searchParams}
                                searchEnrollmentsList={() => searchEnrollmentsList()}
                                tableData={getTableData() ? getTableData().results : []}
                                budgets={budgets}
                                groups={groups}
                                enterpriseId={enterpriseId}
                              />
                            )}
                          </span>
                        </>
                      )}
                      {csvErrorMessage && renderCsvErrorMessage(csvErrorMessage)}
                      <div className="mt-3 mb-5">
                        {enterpriseId && tableMetadata.component}
                      </div>
                    </div>
                  </div>
                </Tab>
                {ModuleActivityReportVisible && (
                  <Tab
                    eventKey="module-activity"
                    title={intl.formatMessage({
                      id: 'adminPortal.lpr.tab.moduleActivity.title',
                      defaultMessage: 'Module Activity (Executive Education)',
                      description: 'Title for the module activity tab in admin portal.',
                    })}
                    id={TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}
                  >
                    <div className="mt-3">
                      <ModuleActivityReport enterpriseId={enterpriseId} />
                    </div>
                  </Tab>
                )}
              </Tabs>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

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
};

export default withParams(withLocation(Admin));

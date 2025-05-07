import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import {
  Alert, Icon,
} from '@openedx/paragon';
import { Error, Undo } from '@openedx/paragon/icons';
import { Link } from 'react-router-dom';
import {
  FormattedMessage, useIntl,
} from '@edx/frontend-platform/i18n';

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import Hero from '../Hero';
import EnrollmentsTable from '../EnrollmentsTable';
import RegisteredLearnersTable from '../RegisteredLearnersTable';
import EnrolledLearnersTable from '../EnrolledLearnersTable';
import EnrolledLearnersForInactiveCoursesTable from '../EnrolledLearnersForInactiveCoursesTable';
import CompletedLearnersTable from '../CompletedLearnersTable';
import PastWeekPassedLearnersTable from '../PastWeekPassedLearnersTable';
import LearnerActivityTable from '../LearnerActivityTable';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import EnterpriseAppSkeleton from '../EnterpriseApp/EnterpriseAppSkeleton';
import AnalyticsOverview from './AnalyticsOverview';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { withLocation, withParams } from '../../hoc';
import BudgetExpiryAlertAndModal from '../BudgetExpiryAlertAndModal';
import LearnerReport from './LearnerReport';
import SortableItem from './SortableItem';
import { getFromLocalStorage, saveToLocalStorage } from '../../utils';
import SubscriptionModal from './SubscriptionModal';
import { SubscriptionData } from '../subscriptions';

import { features } from '../../config';

const Admin = ({
  fetchDashboardAnalytics,
  clearDashboardAnalytics,
  fetchDashboardInsights,
  clearDashboardInsights,
  fetchEnterpriseBudgets,
  clearEnterpriseBudgets,
  fetchEnterpriseGroups,
  clearEnterpriseGroups,
  enterpriseId,
  searchEnrollmentsList,
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
  const DEFAULT_LPR_COMPONENTS = ['analytics-overview', 'learner-report'];
  const LPR_COMPONENTS_KEY = 'lpr-components-order';

  const intl = useIntl();

  const [lprComponents, setLPRComponents] = useState(
    getFromLocalStorage(LPR_COMPONENTS_KEY) || DEFAULT_LPR_COMPONENTS,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLPRComponents((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        saveToLocalStorage(LPR_COMPONENTS_KEY, newOrder);

        return newOrder;
      });
    }
  };

  useEffect(() => {
    if (enterpriseId) {
      fetchDashboardAnalytics(enterpriseId);
      fetchDashboardInsights(enterpriseId);
      fetchEnterpriseBudgets(enterpriseId);
      fetchEnterpriseGroups(enterpriseId);
    }

    return () => {
      clearDashboardAnalytics();
      clearDashboardInsights();
      clearEnterpriseBudgets();
      clearEnterpriseGroups();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseId]);

  const getMetadataForAction = (actionSlugParam) => {
    const defaultData = {
      title: intl.formatMessage({
        id: 'admin.portal.lpr.v2.report.full.report.title',
        defaultMessage: 'Full report',
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
    const { search: searchQuery, pathname } = location;
    // remove the querys from the path
    const queryParams = new URLSearchParams(searchQuery);
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

  const searchParam = location?.search || '';
  const queryParams = new URLSearchParams(searchParam);
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

  // Render components map based on id
  const renderComponent = (id) => {
    switch (id) {
      case 'analytics-overview':
        return (
          <AnalyticsOverview
            insightsLoading={insightsLoading}
            hasCompleteInsights={hasCompleteInsights}
            enterpriseId={enterpriseId}
            error={error}
            loading={loading}
            renderErrorMessage={renderErrorMessage}
          />
        );
      case 'learner-report':
        return (
          <LearnerReport
            tableMetadata={tableMetadata}
            actionSlug={actionSlug}
            filtersActive={filtersActive}
            lastUpdatedDate={lastUpdatedDate}
            renderUrlResetButton={renderUrlResetButton}
            renderFiltersResetButton={renderFiltersResetButton}
            error={error}
            loading={loading}
            location={location}
            hasEmptyData={hasEmptyData}
            renderDownloadButton={renderDownloadButton}
            displaySearchBar={displaySearchBar}
            searchParams={searchParams}
            searchEnrollmentsList={searchEnrollmentsList}
            getTableData={getTableData}
            budgets={budgets}
            groups={groups}
            enterpriseId={enterpriseId}
            csvErrorMessage={csvErrorMessage}
            renderCsvErrorMessage={renderCsvErrorMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main role="main" className="learner-progress-report">
      {!loading && !error && !hasAnalyticsData() ? <EnterpriseAppSkeleton /> : (
        <>
          <Helmet title="Learner Progress Report" />
          <Hero title="Learner Progress Report" />
          <BudgetExpiryAlertAndModal />
          <SubscriptionData enterpriseId={enterpriseId}>
            <SubscriptionModal />
          </SubscriptionData>
          <div className="container-fluid mt-4">
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={lprComponents}
                strategy={verticalListSortingStrategy}
                disabled={!features.ENABLE_DRAG_AND_DROP}
              >
                {lprComponents.map((id) => (
                  <SortableItem key={id} id={id} disabled={!features.ENABLE_DRAG_AND_DROP}>
                    {renderComponent(id)}
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
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

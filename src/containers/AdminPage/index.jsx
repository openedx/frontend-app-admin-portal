import { connect } from 'react-redux';

import {
  clearDashboardAnalytics,
  fetchDashboardAnalytics,
} from '../../data/actions/dashboardAnalytics';

import Admin from '../../components/Admin';
import { paginateTable } from '../../data/actions/table';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';
import { fetchDashboardInsights, clearDashboardInsights } from '../../data/actions/dashboardInsights';
import { fetchEnterpriseBudgets, clearEnterpriseBudgets } from '../../data/actions/enterpriseBudgets';
import { fetchEnterpriseGroups, clearEnterpriseGroups } from '../../data/actions/enterpriseGroups';

const mapStateToProps = state => ({
  loading: state.dashboardAnalytics.loading,
  error: state.dashboardAnalytics.error,
  activeLearners: state.dashboardAnalytics.active_learners,
  enrolledLearners: state.dashboardAnalytics.enrolled_learners,
  numberOfUsers: state.dashboardAnalytics.number_of_users,
  courseCompletions: state.dashboardAnalytics.course_completions,
  lastUpdatedDate: state.dashboardAnalytics.last_updated_date,
  enterpriseId: state.portalConfiguration.enterpriseId,
  csv: state.csv,
  table: state.table,
  insightsLoading: state.dashboardInsights.loading,
  insights: state.dashboardInsights.insights,
  budgetsLoading: state.enterpriseBudgets.loading,
  budgets: state.enterpriseBudgets.budgets,
  groupsLoading: state.enterpriseGroups.loading,
  groups: state.enterpriseGroups.groups,
});

const mapDispatchToProps = dispatch => ({
  fetchDashboardAnalytics: (enterpriseId) => {
    dispatch(fetchDashboardAnalytics(enterpriseId));
  },
  clearDashboardAnalytics: () => {
    dispatch(clearDashboardAnalytics());
  },
  searchEnrollmentsList: () => {
    dispatch(paginateTable('enrollments', EnterpriseDataApiService.fetchCourseEnrollments));
  },
  fetchDashboardInsights: (enterpriseId) => {
    dispatch(fetchDashboardInsights(enterpriseId));
  },
  clearDashboardInsights: () => {
    dispatch(clearDashboardInsights());
  },
  fetchEnterpriseBudgets: (enterpriseId) => {
    dispatch(fetchEnterpriseBudgets(enterpriseId));
  },
  clearEnterpriseBudgets: () => {
    dispatch(clearEnterpriseBudgets());
  },
  fetchEnterpriseGroups: (enterpriseId) => {
    dispatch(fetchEnterpriseGroups(enterpriseId));
  },
  clearEnterpriseGroups: () => {
    dispatch(clearEnterpriseGroups());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Admin);

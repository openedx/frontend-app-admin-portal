import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import {
  clearDashboardAnalytics,
  fetchDashboardAnalytics,
} from '../../data/actions/dashboardAnalytics';

import Admin from '../../components/Admin';
import { paginateTable } from '../../data/actions/table';
import EnterpriseDataApiService from '../../data/services/EnterpriseDataApiService';

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
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin));

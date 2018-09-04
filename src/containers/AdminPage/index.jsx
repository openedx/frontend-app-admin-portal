import { connect } from 'react-redux';

import fetchDashboardAnalytics from '../../data/actions/dashboardAnalytics';
import { fetchCsv } from '../../data/actions/courseEnrollments';
import Admin from '../../components/Admin';

const mapStateToProps = state => ({
  loading: state.dashboardAnalytics.loading,
  error: state.dashboardAnalytics.error,
  activeLearners: state.dashboardAnalytics.active_learners,
  enrolledLearners: state.dashboardAnalytics.enrolled_learners,
  numberOfUsers: state.dashboardAnalytics.number_of_users,
  courseCompletions: state.dashboardAnalytics.course_completions,
  lastUpdatedDate: state.dashboardAnalytics.last_updated_date,
  enterpriseId: state.portalConfiguration.enterpriseId,
  csvLoading: state.courseEnrollments.csvLoading,
  csvError: state.courseEnrollments.csvError,
});

const mapDispatchToProps = dispatch => ({
  getDashboardAnalytics: (enterpriseId) => {
    dispatch(fetchDashboardAnalytics(enterpriseId));
  },
  downloadCsv: (enterpriseId) => {
    dispatch(fetchCsv(enterpriseId));
  },
  resetInitialState: (enterpriseId) => {
    dispatch(fetchDashboardAnalytics(enterpriseId));
  },
});

const AdminPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Admin);

export default AdminPage;

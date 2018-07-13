import { connect } from 'react-redux';

import fetchDashboardAnalytics from '../../data/actions/dashboardAnalytics';
import Admin from '../../components/Admin';

const mapStateToProps = state => ({
  loading: state.dashboardAnalytics.loading,
  error: state.dashboardAnalytics.error,
  activeLearners: state.dashboardAnalytics.active_learners,
  enrolledLearners: state.dashboardAnalytics.enrolled_learners,
  courseCompletions: state.dashboardAnalytics.course_completions,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

const mapDispatchToProps = dispatch => ({
  getDashboardAnalytics: (enterpriseId) => {
    dispatch(fetchDashboardAnalytics(enterpriseId));
  },
});

const AdminPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Admin);

export default AdminPage;

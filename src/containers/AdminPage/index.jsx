import { connect } from 'react-redux';

import fetchDashboardAnalytics from '../../data/actions/dashboardAnalytics';
import { fetchCsv } from '../../data/actions/courseEnrollments';
import Admin from '../../components/Admin';

const mapStateToProps = state => ({
  loading: state.dashboardAnalytics.loading,
  error: state.dashboardAnalytics.error,
  activeLearners: state.dashboardAnalytics.active_learners,
  enrolledLearners: state.dashboardAnalytics.enrolled_learners,
  courseCompletions: state.dashboardAnalytics.course_completions,
  lastUpdatedDate: state.dashboardAnalytics.last_updated_date,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

const mapDispatchToProps = dispatch => ({
  getDashboardAnalytics: (enterpriseId) => {
    dispatch(fetchDashboardAnalytics(enterpriseId));
  },
  downloadCsv: (enterpriseId) => {
    dispatch(fetchCsv(enterpriseId));
  },
});

const AdminPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Admin);

export default AdminPage;

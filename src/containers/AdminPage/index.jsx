import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import fetchDashboardAnalytics from '../../data/actions/dashboardAnalytics';
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
  csv: state.csv,
});

const mapDispatchToProps = dispatch => ({
  getDashboardAnalytics: (enterpriseId) => {
    dispatch(fetchDashboardAnalytics(enterpriseId));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin));

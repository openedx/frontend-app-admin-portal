import { connect } from 'react-redux';

import AdminCards from '../../components/Admin/AdminCards';

const mapStateToProps = state => ({
  activeLearners: state.dashboardAnalytics.active_learners,
  enrolledLearners: state.dashboardAnalytics.enrolled_learners,
  numberOfUsers: state.dashboardAnalytics.number_of_users,
  courseCompletions: state.dashboardAnalytics.course_completions,
});

export default connect(mapStateToProps)(AdminCards);

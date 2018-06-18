import { connect } from 'react-redux';

import fetchCourseEnrollments from '../../data/actions/courseEnrollments';
import CourseEnrollments from '../../components/CourseEnrollments';

const mapStateToProps = state => ({
  enrollments: state.courseEnrollments.enrollments,
  loading: state.courseEnrollments.loading,
  error: state.courseEnrollments.error,
});

const mapDispatchToProps = dispatch => ({
  getCourseEnrollments: (enterpriseId, options) => {
    dispatch(fetchCourseEnrollments(enterpriseId, options));
  },
});

const CourseEnrollmentsPage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CourseEnrollments);

export default CourseEnrollmentsPage;

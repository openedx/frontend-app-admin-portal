import { connect } from 'react-redux';

import fetchCourseEnrollments from '../../data/actions/courseEnrollments';
import WrappedCourseEnrollments from '../../components/CourseEnrollments';

const mapStateToProps = state => ({
  enrollments: state.courseEnrollments.enrollments,
  enterpriseId: state.portalConfiguration.enterpriseId,
  loading: state.courseEnrollments.loading,
  error: state.courseEnrollments.error,
});

const mapDispatchToProps = dispatch => ({
  getCourseEnrollments: (enterpriseId, options) => {
    dispatch(fetchCourseEnrollments(enterpriseId, options));
  },
});

const CourseEnrollmentsTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WrappedCourseEnrollments);

export default CourseEnrollmentsTable;

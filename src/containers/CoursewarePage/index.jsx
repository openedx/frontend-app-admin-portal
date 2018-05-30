import { connect } from 'react-redux';

import Courseware from '../../components/Courseware';
import { fetchCourseOutline } from '../../data/actions/courseOutline';

const mapStateToProps = state => ({
  courseOutline: state.courseOutline.outline,
  unitNodeList: state.courseOutline.unitNodeList,
});

const mapDispatchToProps = dispatch => ({
  getCourseOutline: courseId => dispatch(fetchCourseOutline(courseId)),
});

const CoursewarePage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Courseware);

export default CoursewarePage;

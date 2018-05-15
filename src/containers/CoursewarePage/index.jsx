import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';

import Courseware from '../../components/Courseware';
import { fetchCourseOutline } from '../../data/actions';

const mapStateToProps = state => ({
  courseOutline: state.courseOutline.outline,
  user: state.user
});

const mapDispatchToProps = dispatch => ({
  getCourseOutline: courseRunId => dispatch(fetchCourseOutline(courseRunId)),
});

const CoursewarePage = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Courseware);

export default withCookies(CoursewarePage);

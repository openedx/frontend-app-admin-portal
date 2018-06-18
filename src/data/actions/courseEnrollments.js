import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
  FETCH_COURSE_ENROLLMENTS_FAILURE,
} from '../constants/courseEnrollments';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

const fetchCourseEnrollmentsRequest = () => ({ type: FETCH_COURSE_ENROLLMENTS_REQUEST });
const fetchCourseEnrollmentsSuccess = enrollments => ({
  type: FETCH_COURSE_ENROLLMENTS_SUCCESS,
  payload: { enrollments },
});
const fetchCourseEnrollmentsFailure = error => ({
  type: FETCH_COURSE_ENROLLMENTS_FAILURE,
  payload: { error },
});

const fetchCourseEnrollments = (enterpriseId, options) => (
  (dispatch) => {
    dispatch(fetchCourseEnrollmentsRequest());
    return EnterpriseDataApiService.fetchCourseEnrollments(enterpriseId, options)
      .then((response) => {
        dispatch(fetchCourseEnrollmentsSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchCourseEnrollmentsFailure(error));
      });
  }
);

export default fetchCourseEnrollments;

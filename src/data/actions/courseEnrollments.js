import axios from 'axios';
import qs from 'query-string';

import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
  FETCH_COURSE_ENROLLMENTS_FAILURE,
} from '../constants/courseEnrollments';

const fetchCourseEnrollmentsRequest = () => ({ type: FETCH_COURSE_ENROLLMENTS_REQUEST });
const fetchCourseEnrollmentsSuccess = enrollments => ({
  type: FETCH_COURSE_ENROLLMENTS_SUCCESS,
  payload: { enrollments },
});
const fetchCourseEnrollmentsFailure = error => ({
  type: FETCH_COURSE_ENROLLMENTS_FAILURE,
  payload: { error },
});

const fetchCourseEnrollments = ({ enterpriseId, page, pageSize }) => (
  (dispatch) => {
    dispatch(fetchCourseEnrollmentsRequest());
    const params = {
      page: page || 1,
      page_size: pageSize || 10,
    };

    // NOTE: This is pulling from a local instance of the edx-analytics-data-api (https://github.com/edx/edx-analytics-data-api).
    const enrollmentsUrl = `http://localhost:8000/enterprise/api/v0/enterprise/${enterpriseId}/enrollments/?${qs.stringify(params)}`;
    return axios.get(enrollmentsUrl, {
      withCredentials: true,
      headers: {
        // TODO: JWT token currently hardcoded but will be replaced once authentication
        // is implemented.
        Authorization: 'JWT eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOiBbInJlYWQiLCAid3JpdGUiLCAicHJvZmlsZSIsICJlbWFpbCJdLCAiYWRtaW5pc3RyYXRvciI6IHRydWUsICJhdWQiOiAibG1zLWtleSIsICJmYW1pbHlfbmFtZSI6ICIiLCAiaXNzIjogImh0dHA6Ly9lZHguZGV2c3RhY2subG1zOjE4MDAwL29hdXRoMiIsICJwcmVmZXJyZWRfdXNlcm5hbWUiOiAiZWR4IiwgIm5hbWUiOiAiIiwgImdpdmVuX25hbWUiOiAiIiwgImV4cCI6IDE1MjkwMDQ5NjIsICJpYXQiOiAxNTI4OTY4OTYyLCAiZW1haWwiOiAiZWR4QGV4YW1wbGUuY29tIiwgInN1YiI6ICJmYzJiNzIwMTE0YmIwN2I0NjVlODQzYTc0ZWM2ODNlNiJ9.hhKJKJw8XCh_e99K6iIFpgAjiLDrMs4Dg8pWznMGNy8',
      },
    })
      .then((response) => {
        dispatch(fetchCourseEnrollmentsSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchCourseEnrollmentsFailure(error));
      });
  }
);

export default fetchCourseEnrollments;

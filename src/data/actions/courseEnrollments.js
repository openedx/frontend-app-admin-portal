import { saveAs } from 'file-saver/FileSaver';

import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
  FETCH_COURSE_ENROLLMENTS_FAILURE,
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
} from '../constants/courseEnrollments';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

const emptyEnrollments = {
  count: 0,
  num_pages: 0,
  current_page: 0,
  results: [],
};

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
        // This endpoint returns a 404 if no data exists,
        // so we convert it to an empty response here.
        if (error.response.status === 404) {
          dispatch(fetchCourseEnrollmentsSuccess(emptyEnrollments));
          return;
        }
        dispatch(fetchCourseEnrollmentsFailure(error));
      });
  }
);

const fetchCsvRequest = () => ({ type: FETCH_CSV_REQUEST });
const fetchCsvSuccess = () => ({
  type: FETCH_CSV_SUCCESS,
});
const fetchCsvFailure = error => ({
  type: FETCH_CSV_FAILURE,
  payload: { error },
});

const fetchCsv = (enterpriseId, options) => (
  (dispatch) => {
    dispatch(fetchCsvRequest());
    return EnterpriseDataApiService.fetchCourseEnrollmentsCsv(enterpriseId, options)
      .then((response) => {
        saveAs(new Blob([response.data]), `${enterpriseId}_progress_report.csv`);
        dispatch(fetchCsvSuccess());
      })
      .catch((error) => {
        dispatch(fetchCsvFailure(error));
      });
  }
);
export {
  fetchCourseEnrollments,
  fetchCsv,
};

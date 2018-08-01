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

const fetchCsvRequest = () => ({ type: FETCH_CSV_REQUEST });
const fetchCsvSuccess = () => ({
  type: FETCH_CSV_SUCCESS,
});
const fetchCsvFailure = error => ({
  type: FETCH_CSV_FAILURE,
  payload: { error },
});

const fetchCsv = enterpriseId => (
  (dispatch) => {
    dispatch(fetchCsvRequest());
    return EnterpriseDataApiService.fetchCourseEnrollmentsCsv(enterpriseId)
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

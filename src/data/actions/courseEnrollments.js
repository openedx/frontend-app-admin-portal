import { saveAs } from 'file-saver/FileSaver';

import {
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
} from '../constants/courseEnrollments';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

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
export default fetchCsv;

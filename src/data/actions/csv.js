import { logError } from '@edx/frontend-platform/logging';
import { saveAs } from 'file-saver/FileSaver';

import {
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
  CLEAR_CSV,
} from '../constants/csv';
import store from '../store';

const fetchCsvRequest = csvId => ({
  type: FETCH_CSV_REQUEST,
  payload: { csvId },
});
const fetchCsvSuccess = csvId => ({
  type: FETCH_CSV_SUCCESS,
  payload: { csvId },
});
const fetchCsvFailure = (csvId, error) => ({
  type: FETCH_CSV_FAILURE,
  payload: {
    csvId,
    error,
  },
});

const fetchCsv = (csvId, fetchMethod) => (
  (dispatch) => {
    const { enterpriseId } = store.getState().portalConfiguration;
    dispatch(fetchCsvRequest(csvId));
    return fetchMethod(enterpriseId)
      .then((response) => {
        // Create blob with explicit MIME type
        const blob = new Blob([response.data], {
          type: 'text/csv;charset=utf-8;',
        });
        saveAs(blob, `${enterpriseId}_progress_report.csv`);
        dispatch(fetchCsvSuccess(csvId));
      })
      .catch((error) => {
        logError(error);
        dispatch(fetchCsvFailure(csvId, error));
      });
  }
);

const clearCsv = csvId => dispatch => (dispatch({
  type: CLEAR_CSV,
  payload: {
    csvId,
  },
}));

export {
  fetchCsv,
  clearCsv,
};

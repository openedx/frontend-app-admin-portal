import {
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
  CLEAR_CSV,
} from '../constants/csv';

// Csv state will be a map of csvId to that csv state
// This helper handles the state update for a csv
const updateCsv = (state, csvId, updatedCsvState) => ({
  ...state,
  [csvId]: {
    ...state[csvId],
    ...updatedCsvState,
  },
});

const csv = (state = {}, action = {}) => {
  switch (action.type) {
    case FETCH_CSV_REQUEST:
      return updateCsv(state, action.payload.csvId, {
        csvLoading: true,
        csvError: null,
      });
    case FETCH_CSV_SUCCESS:
      return updateCsv(state, action.payload.csvId, {
        csvLoading: false,
        csvError: null,
      });
    case FETCH_CSV_FAILURE:
      return updateCsv(state, action.payload.csvId, {
        csvLoading: false,
        csvError: action.payload.error,
      });
    case CLEAR_CSV:
      return updateCsv(state, action.payload.csvId, {
        csvLoading: false,
        csvError: null,
      });
    default:
      return state;
  }
};

export default csv;

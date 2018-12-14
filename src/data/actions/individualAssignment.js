import {
  INDIVIDUAL_ASSIGNMENT_REQUEST,
  INDIVIDUAL_ASSIGNMENT_SUCCESS,
  INDIVIDUAL_ASSIGNMENT_FAILURE,
} from '../constants/individualAssignment';


import EcommerceApiService from '../services/EcommerceApiService';

const fetchIndividualAssignmentRequest = () => ({
  type: INDIVIDUAL_ASSIGNMENT_REQUEST,
});

const fetchIndividualAssignmentSuccess = data => ({
  type: INDIVIDUAL_ASSIGNMENT_SUCCESS,
  payload: {
    data,
  },
});

const fetchIndividualAssignmentFailure = error => ({
  type: INDIVIDUAL_ASSIGNMENT_FAILURE,
  payload: {
    error,
  },
});


const fetchIndividualAssignment = options => (
  (dispatch) => {
    dispatch(fetchIndividualAssignmentRequest(options));
    return EcommerceApiService.fetchIndividualAssignment(options)
      .then((response) => {
        dispatch(fetchIndividualAssignmentSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchIndividualAssignmentFailure(error));
      });
  }
);

export default fetchIndividualAssignment;

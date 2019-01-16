import {
  CODE_ASSIGNMENT_REQUEST,
  CODE_ASSIGNMENT_SUCCESS,
  CODE_ASSIGNMENT_FAILURE,
} from '../constants/codeAssignment';

import EcommerceApiService from '../services/EcommerceApiService';

const sendCodeAssignmentRequest = () => ({
  type: CODE_ASSIGNMENT_REQUEST,
});

const sendCodeAssignmentSuccess = data => ({
  type: CODE_ASSIGNMENT_SUCCESS,
  payload: {
    data,
  },
});

const sendCodeAssignmentFailure = error => ({
  type: CODE_ASSIGNMENT_FAILURE,
  payload: {
    error,
  },
});

const sendCodeAssignment = ({
  couponId,
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendCodeAssignmentRequest());
    return EcommerceApiService.sendCodeAssignment(couponId, options)
      .then((response) => {
        dispatch(sendCodeAssignmentSuccess(response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(sendCodeAssignmentFailure(error));
        onError(error);
      });
  }
);

export default sendCodeAssignment;

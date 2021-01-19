import {
  BULK_ENROLLMENT_REQUEST,
  BULK_ENROLLMENT_SUCCESS,
  BULK_ENROLLMENT_FAILURE,
} from '../constants/bulkEnrollment';

import LmsApiService from '../services/LmsApiService';

const sendBulkEnrollmentRequest = () => ({
  type: BULK_ENROLLMENT_REQUEST,
});

const sendBulkEnrollmentSuccess = data => ({
  type: BULK_ENROLLMENT_SUCCESS,
  payload: {
    data,
  },
});

const sendBulkEnrollmentFailure = error => ({
  type: BULK_ENROLLMENT_FAILURE,
  payload: {
    error,
  },
});

const sendBulkEnrollment = ({
  enterpriseUuid,
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendBulkEnrollmentRequest());
    return LmsApiService.sendBulkEnrollment(enterpriseUuid, options)
      .then((response) => {
        dispatch(sendBulkEnrollmentSuccess(response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(sendBulkEnrollmentFailure(error));
        onError(error);
      });
  }
);

export default sendBulkEnrollment;

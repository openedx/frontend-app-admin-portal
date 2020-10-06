import {
  CODE_VISIBILITY_REQUEST,
  CODE_VISIBILITY_SUCCESS,
  CODE_VISIBILITY_FAILURE,
} from '../constants/codeVisibility';

import EcommerceApiService from '../services/EcommerceApiService';

const sendCodeVisibilityRequest = () => ({
  type: CODE_VISIBILITY_REQUEST,
});

const sendCodeVisibilitySuccess = data => ({
  type: CODE_VISIBILITY_SUCCESS,
  payload: {
    data,
  },
});

const sendCodeVisibilityFailure = error => ({
  type: CODE_VISIBILITY_FAILURE,
  payload: {
    error,
  },
});

const updateCodeVisibility = ({
  couponId,
  codeIds,
  isPublic,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendCodeVisibilityRequest());
    return EcommerceApiService.sendCodeVisibility(couponId, codeIds, isPublic)
      .then((response) => {
        dispatch(sendCodeVisibilitySuccess(response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(sendCodeVisibilityFailure(error));
        onError(error);
      });
  }
);

export default updateCodeVisibility;

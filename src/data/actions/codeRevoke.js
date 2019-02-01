import {
  CODE_REVOKE_REQUEST,
  CODE_REVOKE_SUCCESS,
  CODE_REVOKE_FAILURE,
} from '../constants/codeRevoke';

import EcommerceApiService from '../services/EcommerceApiService';

const sendCodeRevokeRequest = () => ({
  type: CODE_REVOKE_REQUEST,
});

const sendCodeRevokeSuccess = data => ({
  type: CODE_REVOKE_SUCCESS,
  payload: {
    data,
  },
});

const sendCodeRevokeFailure = error => ({
  type: CODE_REVOKE_FAILURE,
  payload: {
    error,
  },
});

const sendCodeRevoke = ({
  couponId,
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendCodeRevokeRequest());
    return EcommerceApiService.sendCodeRevoke(couponId, options)
      .then((response) => {
        dispatch(sendCodeRevokeSuccess(response.data));
        onSuccess(response.data);
      })
      .catch((error) => {
        dispatch(sendCodeRevokeFailure(error));
        onError(error);
      });
  }
);

export default sendCodeRevoke;

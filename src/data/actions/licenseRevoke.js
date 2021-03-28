import { logError } from '@edx/frontend-platform/logging';
import {
  LICENSE_REVOKE_REQUEST,
  LICENSE_REVOKE_SUCCESS,
  LICENSE_REVOKE_FAILURE,
} from '../constants/licenseRevoke';

import LicenseManagerApiService from '../services/LicenseManagerAPIService';

const sendLicenseRevokeRequest = () => ({
  type: LICENSE_REVOKE_REQUEST,
});

const sendLicenseRevokeSuccess = data => ({
  type: LICENSE_REVOKE_SUCCESS,
  payload: {
    data,
  },
});

const sendLicenseRevokeFailure = error => ({
  type: LICENSE_REVOKE_FAILURE,
  payload: {
    error,
  },
});

const sendLicenseRevoke = ({
  subscriptionUUID,
  options,
  onSuccess = () => {},
  onError = () => {},
}) => (
  (dispatch) => {
    dispatch(sendLicenseRevokeRequest());
    return LicenseManagerApiService.licenseRevoke(subscriptionUUID, options)
      .then((response) => {
        dispatch(sendLicenseRevokeSuccess(response));
        onSuccess(response);
      })
      .catch((error) => {
        logError(error);
        dispatch(sendLicenseRevokeFailure(error));
        onError(error);
      });
  }
);

export default sendLicenseRevoke;

import { logError } from '@edx/frontend-platform/logging';
import {
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
} from '../constants/enterpriseCustomerAdmin';
import LmsApiService from '../services/LmsApiService';

const fetchLoggedInEnterpriseAdminRequest = () => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
});

const fetchLoggedInEnterpriseAdminSuccess = response => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  payload: {
    data: response.data?.results?.[0],
  },
});

const fetchLoggedInEnterpriseAdminFailure = error => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  payload: { error },
});

const fetchLoggedInEnterpriseAdmin = () => (
  async (dispatch) => {
    try {
      dispatch(fetchLoggedInEnterpriseAdminRequest());
      const response = await LmsApiService.fetchLoggedInEnterpriseAdminProfile();
      dispatch(fetchLoggedInEnterpriseAdminSuccess(response));
    } catch (error) {
      logError(error);
      dispatch(fetchLoggedInEnterpriseAdminFailure(error));
    }
  }
);

export {
  fetchLoggedInEnterpriseAdmin,
};

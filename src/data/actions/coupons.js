import {
  COUPONS_REQUEST,
  COUPONS_SUCCESS,
  COUPONS_FAILURE,
  CLEAR_COUPONS,
} from '../constants/coupons';

// import { updateUrl } from '../../utils';

import EcommerceApiService from '../services/EcommerceApiService';

const fetchCouponOrdersRequest = () => ({
  type: COUPONS_REQUEST,
});

const fetchCouponOrdersSuccess = data => ({
  type: COUPONS_SUCCESS,
  payload: {
    data,
  },
});

const fetchCouponOrdersFailure = error => ({
  type: COUPONS_FAILURE,
  payload: {
    error,
  },
});

const clearCouponOrdersEvent = () => ({ type: CLEAR_COUPONS });

const fetchCouponOrders = options => (
  (dispatch) => {
    dispatch(fetchCouponOrdersRequest(options));
    return EcommerceApiService.fetchCouponOrders(options)
      .then((response) => {
        dispatch(fetchCouponOrdersSuccess(response.data));
      })
      .catch((error) => {
        // This endpoint returns a 404 if no data exists,
        // so we convert it to an empty response here.
        if (error.response.status === 404) {
          dispatch(fetchCouponOrdersSuccess({ results: [] }));
          return;
        }
        dispatch(fetchCouponOrdersFailure(error));
      });
  }
);

const clearCouponOrders = () => (
  (dispatch) => {
    dispatch(clearCouponOrdersEvent());
  }
);

export {
  fetchCouponOrders,
  clearCouponOrders,
};

import {
  COUPONS_REQUEST,
  COUPONS_SUCCESS,
  COUPONS_FAILURE,
  CLEAR_COUPONS,
  COUPON_REQUEST,
  COUPON_SUCCESS,
  COUPON_FAILURE,
} from '../constants/coupons';

const initialState = {
  loading: false,
  data: null,
  error: null,
  couponOverviewLoading: null,
  couponOverviewError: null,
};

// eslint-disable-next-line @typescript-eslint/default-param-last
const couponsReducer = (state = initialState, action) => {
  switch (action.type) {
    // Handle actions for all coupons (i.e., all coupons on Code Management page)
    case COUPONS_REQUEST:
      return {
        loading: true,
        error: null,
      };
    case COUPONS_SUCCESS:
      return {
        loading: false,
        error: null,
        data: action.payload.data,
      };
    case COUPONS_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    // Handle actions for individual coupon
    case COUPON_REQUEST:
      return {
        ...state,
        couponOverviewLoading: true,
        couponOverviewError: null,
      };
    case COUPON_SUCCESS: {
      const { data: { results } } = state;
      const couponId = action.payload.data.id;
      const index = results.findIndex(item => item.id === couponId);

      results[index] = action.payload.data;

      return {
        ...state,
        couponOverviewLoading: false,
        couponOverviewError: null,
        data: {
          ...state.data,
          results,
        },
      };
    }
    case COUPON_FAILURE:
      return {
        ...state,
        couponOverviewLoading: false,
        couponOverviewError: action.payload.error,
      };
    case CLEAR_COUPONS:
      return {
        loading: false,
        error: null,
        couponOverviewLoading: false,
        couponOverviewError: null,
        data: null,
      };
    default:
      return state;
  }
};

export default couponsReducer;

import {
  COUPONS_REQUEST,
  COUPONS_SUCCESS,
  COUPONS_FAILURE,
  CLEAR_COUPONS,
  COUPON_SUCCESS,
} from '../constants/coupons';

const initialState = {
  loading: false,
  error: null,
  data: null,
};

const couponsReducer = (state = initialState, action) => {
  switch (action.type) {
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
    case COUPON_SUCCESS: {
      const { data: { results } } = state;
      const couponId = action.payload.data.id;
      const index = results.findIndex(item => item.id === couponId);
      results[index] = action.payload.data;
      return {
        ...state,
        data: {
          ...state.data,
          results,
        },
      };
    }
    case COUPONS_FAILURE:
      return {
        loading: false,
        error: action.payload.error,
      };
    case CLEAR_COUPONS:
      return {
        loading: false,
        error: null,
        data: null,
      };
    default:
      return state;
  }
};

export default couponsReducer;

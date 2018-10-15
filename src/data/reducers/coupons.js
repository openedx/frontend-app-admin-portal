import {
  COUPONS_REQUEST,
  COUPONS_SUCCESS,
  COUPONS_FAILURE,
  CLEAR_COUPONS,
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

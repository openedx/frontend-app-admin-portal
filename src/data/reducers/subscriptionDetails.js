import {
  FETCH_SUBSCRIPTION_DETAILS_REQUEST,
  FETCH_SUBSCRIPTION_DETAILS_SUCCESS,
  FETCH_SUBSCRIPTION_DETAILS_FAILURE,
  CLEAR_SUBSCRIPTION_DETAILS,
} from '../constants/subscriptionDetails';

const initialState = {
  loading: false,
  error: null,
  uuid: null,
  purchaseDate: null,
  startDate: null,
  endDate: null,
  licenses: {
    allocated: 0,
    available: 0,
  },
};

const subscriptionDetails = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SUBSCRIPTION_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_SUBSCRIPTION_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        uuid: action.payload.data.uuid,
        purchaseDate: action.payload.data.purchaseDate,
        startDate: action.payload.data.startDate,
        endDate: action.payload.data.endDate,
        licenses: action.payload.data.licenses,
      };
    case FETCH_SUBSCRIPTION_DETAILS_FAILURE:
      return {
        ...state,
        ...initialState,
        error: action.payload.error,
      };
    case CLEAR_SUBSCRIPTION_DETAILS:
      return {
        ...state,
        ...initialState,
      };
    default:
      return state;
  }
};

export default subscriptionDetails;

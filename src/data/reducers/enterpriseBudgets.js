import {
  FETCH_ENTERPRISE_BUDGETS_REQUEST,
  FETCH_ENTERPRISE_BUDGETS_SUCCESS,
  FETCH_ENTERPRISE_BUDGETS_FAILURE,
  CLEAR_ENTERPRISE_BUDGETS,
} from '../constants/enterpriseBudgets';

const initialState = {
  loading: false,
  error: null,
  budgets: null,
};

const enterpriseBudgets = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ENTERPRISE_BUDGETS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ENTERPRISE_BUDGETS_SUCCESS:
      return {
        ...state,
        loading: false,
        budgets: action.payload.data,
      };
    case FETCH_ENTERPRISE_BUDGETS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        budgets: null,
      };
    case CLEAR_ENTERPRISE_BUDGETS:
      return {
        ...state,
        loading: false,
        error: null,
        budgets: null,
      };
    default:
      return state;
  }
};

export default enterpriseBudgets;

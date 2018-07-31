import {
  FETCH_ENTERPRISE_LIST_REQUEST,
  FETCH_ENTERPRISE_LIST_SUCCESS,
  FETCH_ENTERPRISE_LIST_FAILURE,
} from '../constants/enterpriseList';

const initialState = {
  enterprises: null,
  loading: false,
  error: null,
};

const enterpriseList = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ENTERPRISE_LIST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ENTERPRISE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        enterprises: action.payload.enterprises,
      };
    case FETCH_ENTERPRISE_LIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        enterprises: null,
      };
    default:
      return state;
  }
};

export default enterpriseList;

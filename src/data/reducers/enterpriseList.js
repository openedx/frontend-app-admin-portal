import {
  FETCH_ENTERPRISE_LIST_REQUEST,
  FETCH_ENTERPRISE_LIST_SUCCESS,
  FETCH_ENTERPRISE_LIST_FAILURE,
  SET_ENTERPRISE_LIST_SEARCH_QUERY,
} from '../constants/enterpriseList';

const initialState = {
  enterprises: null,
  searchQuery: null,
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
        enterprises: null,
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
    case SET_ENTERPRISE_LIST_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload.searchQuery,
      };
    default:
      return state;
  }
};

export default enterpriseList;

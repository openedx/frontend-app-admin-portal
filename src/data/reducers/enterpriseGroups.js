import {
  FETCH_ENTERPRISE_GROUPS_REQUEST,
  FETCH_ENTERPRISE_GROUPS_SUCCESS,
  FETCH_ENTERPRISE_GROUPS_FAILURE,
  CLEAR_ENTERPRISE_GROUPS,
} from '../constants/enterpriseGroups';

const initialState = {
  loading: false,
  error: null,
  groups: [],
};

const enterpriseGroups = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ENTERPRISE_GROUPS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ENTERPRISE_GROUPS_SUCCESS:
      return {
        ...state,
        loading: false,
        groups: action.payload.data,
      };
    case FETCH_ENTERPRISE_GROUPS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        groups: [],
      };
    case CLEAR_ENTERPRISE_GROUPS:
      return {
        ...state,
        loading: false,
        error: null,
        groups: [],
      };
    default:
      return state;
  }
};

export default enterpriseGroups;

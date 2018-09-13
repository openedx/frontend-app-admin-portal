import {
  ENABLE_SIDEBAR,
  TOGGLE_SIDEBAR,
  FETCH_SIDEBAR_DATA_REQUEST,
  FETCH_SIDEBAR_DATA_SUCCESS,
  FETCH_SIDEBAR_DATA_FAILURE,
} from '../constants/sidebar';

const initialState = {
  data: null,
  expanded: true,
  enabled: false,
  loading: false,
  error: null,
};

const sidebar = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return {
        ...state,
        expanded: !state.expanded,
      };
    case ENABLE_SIDEBAR:
      return {
        ...state,
        enabled: action.enabled,
      };
    case FETCH_SIDEBAR_DATA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_SIDEBAR_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload.data,
      };
    case FETCH_SIDEBAR_DATA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        data: null,
      };
    default:
      return state;
  }
};

export default sidebar;

import {
  FETCH_COURSE_OUTLINE_REQUEST,
  FETCH_COURSE_OUTLINE_SUCCESS,
  FETCH_COURSE_OUTLINE_FAILURE,
} from '../constants/courseOutline';

const courseOutline = (state = {
  outline: undefined,
  unitNodeList: undefined,
  loading: false,
  error: null,
}, action) => {
  switch (action.type) {
    case FETCH_COURSE_OUTLINE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_COURSE_OUTLINE_SUCCESS:
      return {
        ...state,
        loading: false,
        outline: action.payload.outline,
        unitNodeList: action.payload.unitNodeList,
      };
    case FETCH_COURSE_OUTLINE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        outline: undefined,
        unitNodeList: undefined,
      };
    default:
      return state;
  }
};

export default courseOutline;

import {
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
} from '../constants/global';

export const initialState = {
  headerHeight: 0,
  footerHeight: 0,
};

export const globalReducer = (state = initialState, action) => {
  switch (action.type) {
    case HEADER_HEIGHT:
      return {
        ...state,
        headerHeight: action.payload.headerHeight,
      };
    case FOOTER_HEIGHT:
      return {
        ...state,
        footerHeight: action.payload.footerHeight,
      };
    default:
      return state;
  }
};

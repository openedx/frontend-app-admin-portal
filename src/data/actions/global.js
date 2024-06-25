import {
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
} from '../constants/global';

const headerHeight = (refValue = 0) => ({
  type: HEADER_HEIGHT,
  payload: { headerHeight: refValue },
});

const footerHeight = (refValue = 0) => ({
  type: FOOTER_HEIGHT,
  payload: { footerHeight: refValue },
});

const getGlobalHeightFromState = (state) => state;

export {
  headerHeight,
  footerHeight,
  getGlobalHeightFromState,
};

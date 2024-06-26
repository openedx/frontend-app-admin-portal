import {
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
} from '../constants/global';

const setHeaderHeight = (refValue = 0) => ({
  type: HEADER_HEIGHT,
  payload: { headerHeight: refValue },
});

const setFooterHeight = (refValue = 0) => ({
  type: FOOTER_HEIGHT,
  payload: { footerHeight: refValue },
});

export {
  setHeaderHeight,
  setFooterHeight,
};

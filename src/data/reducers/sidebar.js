import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
  TOGGLE_SIDEBAR_TOGGLE,
} from '../constants/sidebar';

const initialState = {
  isExpanded: false,
  isExpandedByToggle: false,
  hasSidebarToggle: false,
};

const sidebarReducer = (state = initialState, action = {}) => {
  const getStateKey = () => {
    const { payload: { usingToggle } } = action;
    return usingToggle ? 'isExpandedByToggle' : 'isExpanded';
  };

  switch (action.type) {
    case EXPAND_SIDEBAR:
      return {
        ...state,
        [getStateKey()]: true,
      };
    case COLLAPSE_SIDEBAR:
      return {
        ...state,
        [getStateKey()]: false,
      };
    case TOGGLE_SIDEBAR_TOGGLE:
      return {
        ...state,
        hasSidebarToggle: !state.hasSidebarToggle,
      };
    default:
      return state;
  }
};

export default sidebarReducer;

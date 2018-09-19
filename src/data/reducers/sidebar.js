import {
  ENABLE_SIDEBAR,
  TOGGLE_SIDEBAR,
} from '../constants/sidebar';

const sidebar = (state = { expanded: true, enabled: false }, action) => {
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
    default:
      return state;
  }
};

export default sidebar;

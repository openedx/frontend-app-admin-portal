import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
  TOGGLE_SIDEBAR_TOGGLE,
} from '../constants/sidebar';

const expandSidebar = (usingToggle = false) => ({
  type: EXPAND_SIDEBAR,
  payload: {
    usingToggle,
  },
});

const collapseSidebar = (usingToggle = false) => ({
  type: COLLAPSE_SIDEBAR,
  payload: {
    usingToggle,
  },
});

const toggleSidebarToggle = () => ({
  type: TOGGLE_SIDEBAR_TOGGLE,
});

export {
  expandSidebar,
  collapseSidebar,
  toggleSidebarToggle,
};

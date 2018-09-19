import {
  ENABLE_SIDEBAR,
  TOGGLE_SIDEBAR,
} from '../constants/sidebar';

const enableSidebar = enabled => ({
  type: ENABLE_SIDEBAR,
  enabled,
});

const toggleSidebar = () => ({
  type: TOGGLE_SIDEBAR,
});

export {
  enableSidebar,
  toggleSidebar,
};

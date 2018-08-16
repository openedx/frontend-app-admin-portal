import {
  SET_PORTAL_CONFIGURATION,
  CLEAR_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

const setPortalConfigurationEvent = data => ({
  type: SET_PORTAL_CONFIGURATION,
  payload: { data },
});

const clearPortalConfigurationEvent = () => ({ type: CLEAR_PORTAL_CONFIGURATION });

const setPortalConfiguration = enterprise => (
  (dispatch) => {
    dispatch(setPortalConfigurationEvent(enterprise));
  }
);

const clearPortalConfiguration = () => (
  (dispatch) => {
    dispatch(clearPortalConfigurationEvent());
  }
);

export {
  setPortalConfiguration,
  clearPortalConfiguration,
};

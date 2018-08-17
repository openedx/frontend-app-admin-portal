import {
  SET_PORTAL_CONFIGURATION,
  CLEAR_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

const initialState = {
  enterpriseId: null,
  enterpriseName: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
};

const portalConfiguration = (state = initialState, action) => {
  switch (action.type) {
    case SET_PORTAL_CONFIGURATION:
      return {
        ...state,
        enterpriseId: action.payload.data.uuid,
        enterpriseName: action.payload.data.name,
        enterpriseSlug: action.payload.data.slug,
        enterpriseLogo: action.payload.data.branding_configuration
          ? action.payload.data.branding_configuration.logo
          : null,
      };
    case CLEAR_PORTAL_CONFIGURATION:
      return {
        ...state,
        enterpriseId: null,
        enterpriseName: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
      };
    default:
      return state;
  }
};

export default portalConfiguration;

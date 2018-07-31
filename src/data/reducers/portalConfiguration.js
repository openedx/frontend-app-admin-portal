import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
  CLEAR_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

const initialState = {
  loading: false,
  error: null,
  enterpriseId: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
};

const portalConfiguration = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PORTAL_CONFIGURATION_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_PORTAL_CONFIGURATION_SUCCESS:
      return {
        ...state,
        loading: false,
        enterpriseId: action.payload.data.enterprise_customer,
        enterpriseSlug: action.payload.data.enterprise_slug,
        enterpriseLogo: action.payload.data.logo,
      };
    case FETCH_PORTAL_CONFIGURATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        enterpriseId: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
      };
    case CLEAR_PORTAL_CONFIGURATION:
      return {
        ...state,
        loading: false,
        error: null,
        enterpriseId: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
      };
    default:
      return state;
  }
};

export default portalConfiguration;

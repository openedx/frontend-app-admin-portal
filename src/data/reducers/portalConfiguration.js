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
  enterpriseName: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
  enableCodeManagementScreen: false,
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
        error: null,
        enterpriseId: action.payload.data.uuid,
        enterpriseName: action.payload.data.name,
        enterpriseSlug: action.payload.data.slug,
        enterpriseLogo: action.payload.data.branding_configuration
          ? action.payload.data.branding_configuration.logo
          : null,
        enableCodeManagementScreen: action.payload.data.enable_portal_code_management_screen,
        enableReportingConfigScreen: action.payload.data.enable_portal_reporting_config_screen,
      };
    case FETCH_PORTAL_CONFIGURATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        enterpriseId: null,
        enterpriseName: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
        enableCodeManagementScreen: false,
      };
    case CLEAR_PORTAL_CONFIGURATION:
      return {
        ...state,
        enterpriseId: null,
        enterpriseName: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
        enableCodeManagementScreen: false,
      };
    default:
      return state;
  }
};

export default portalConfiguration;

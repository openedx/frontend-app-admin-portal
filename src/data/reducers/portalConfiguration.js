import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
  CLEAR_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

export const PORTAL_CONFIG_INITIAL_STATE = {
  loading: false,
  error: null,
  enterpriseId: null,
  enterpriseName: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
  enableCodeManagementScreen: false,
  enableBulkEnrollmentScreen: false,
  enableReportingConfigScreen: false,
  enableSubscriptionManagementScreen: false,
  enableSamlConfigurationScreen: false,
  enableAnalyticsScreen: false,
};

const portalConfiguration = (state = PORTAL_CONFIG_INITIAL_STATE, action) => {
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
        enableSubscriptionManagementScreen: action.payload.data.enable_portal_subscription_management_screen, // eslint-disable-line max-len
        enableSamlConfigurationScreen: action.payload.data.enable_portal_saml_configuration_screen,
        enableAnalyticsScreen: action.payload.data.enable_analytics_screen,
        enableLearnerPortal: action.payload.data.enable_learner_portal,
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
        enableReportingConfigScreen: false,
        enableSubscriptionManagementScreen: false,
        enableSamlConfigurationScreen: false,
        enableAnalyticsScreen: false,
      };
    case CLEAR_PORTAL_CONFIGURATION:
      return {
        ...state,
        enterpriseId: null,
        enterpriseName: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
        enableCodeManagementScreen: false,
        enableReportingConfigScreen: false,
        enableSubscriptionManagementScreen: false,
        enableSamlConfigurationScreen: false,
        enableAnalyticsScreen: false,
      };
    default:
      return state;
  }
};

export default portalConfiguration;

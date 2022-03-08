import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
  CLEAR_PORTAL_CONFIGURATION,
  UPDATE_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

const initialState = {
  loading: true,
  error: null,
  contactEmail: null,
  enterpriseId: null,
  enterpriseName: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
  enableCodeManagementScreen: false,
  enableReportingConfigScreen: false,
  enableSubscriptionManagementScreen: false,
  enableSamlConfigurationScreen: false,
  enableLmsConfigurationsScreen: false,
  enableAnalyticsScreen: false,
  enableUniversalLink: false,
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
        contactEmail: action.payload.data.contact_email,
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
        enableLmsConfigurationsScreen: action.payload.data.enable_portal_lms_configurations_screen,
        enableUniversalLink: action.payload.data.enable_universal_link,
        identityProvider: action.payload.data.identity_provider,
      };
    case FETCH_PORTAL_CONFIGURATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        contactEmail: null,
        enterpriseId: null,
        enterpriseName: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
        enableCodeManagementScreen: false,
        enableReportingConfigScreen: false,
        enableSubscriptionManagementScreen: false,
        enableSamlConfigurationScreen: false,
        enableLmsConfigurationsScreen: false,
        enableAnalyticsScreen: false,
        enableUniversalLink: false,
      };
    case CLEAR_PORTAL_CONFIGURATION:
      return {
        ...state,
        contactEmail: null,
        enterpriseId: null,
        enterpriseName: null,
        enterpriseSlug: null,
        enterpriseLogo: null,
        enableCodeManagementScreen: false,
        enableReportingConfigScreen: false,
        enableSubscriptionManagementScreen: false,
        enableSamlConfigurationScreen: false,
        enableLmsConfigurationsScreen: false,
        enableAnalyticsScreen: false,
        enableUniversalLink: false,
      };
    case UPDATE_PORTAL_CONFIGURATION:
      return {
        ...state,
        ...action.payload.data,
      };
    default:
      return state;
  }
};

export default portalConfiguration;

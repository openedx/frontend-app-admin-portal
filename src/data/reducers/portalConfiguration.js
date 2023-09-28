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
  enterpriseBranding: null,
  identityProvider: null,
  enableCodeManagementScreen: false,
  enableReportingConfigScreen: false,
  enableSubscriptionManagementScreen: false,
  enableSamlConfigurationScreen: false,
  enableLmsConfigurationsScreen: false,
  enableAnalyticsScreen: false,
  enableIntegratedCustomerLearnerPortalSearch: false,
  enableLearnerPortal: false,
  enableUniversalLink: false,
  enablePortalLearnerCreditManagementScreen: false,
  enableApiCredentialGeneration: false,
  enterpriseFeatures: {},
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
        enterpriseBranding: action.payload.data.branding_configuration,
        identityProvider: action.payload.data.identity_provider,
        enableCodeManagementScreen: action.payload.data.enable_portal_code_management_screen,
        enableReportingConfigScreen: action.payload.data.enable_portal_reporting_config_screen,
        enableSubscriptionManagementScreen: action.payload.data.enable_portal_subscription_management_screen, // eslint-disable-line max-len
        enableSamlConfigurationScreen: action.payload.data.enable_portal_saml_configuration_screen,
        enableAnalyticsScreen: action.payload.data.enable_analytics_screen,
        enableLearnerPortal: action.payload.data.enable_learner_portal,
        enableIntegratedCustomerLearnerPortalSearch: action.payload.data.enable_integrated_customer_learner_portal_search, // eslint-disable-line max-len
        enableLmsConfigurationsScreen: action.payload.data.enable_portal_lms_configurations_screen,
        enableUniversalLink: action.payload.data.enable_universal_link,
        enablePortalLearnerCreditManagementScreen: action.payload.data.enable_portal_learner_credit_management_screen,
        enableApiCredentialGeneration: action.payload.data.enable_generation_of_api_credentials,
        enterpriseFeatures: action.payload.enterpriseFeatures,
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
        enterpriseBranding: null,
        identityProvider: null,
        enableCodeManagementScreen: false,
        enableReportingConfigScreen: false,
        enableSubscriptionManagementScreen: false,
        enableSamlConfigurationScreen: false,
        enableAnalyticsScreen: false,
        enableLearnerPortal: false,
        enableIntegratedCustomerLearnerPortalSearch: false,
        enableLmsConfigurationsScreen: false,
        enableUniversalLink: false,
        enablePortalLearnerCreditManagementScreen: false,
        enableApiCredentialGeneration: false,
        enterpriseFeatures: {},
      };
    case CLEAR_PORTAL_CONFIGURATION:
      return {
        ...state,
        contactEmail: null,
        enterpriseId: null,
        enterpriseName: null,
        enterpriseSlug: null,
        enterpriseBranding: null,
        identityProvider: null,
        enableCodeManagementScreen: false,
        enableReportingConfigScreen: false,
        enableSubscriptionManagementScreen: false,
        enableSamlConfigurationScreen: false,
        enableAnalyticsScreen: false,
        enableLearnerPortal: false,
        enableIntegratedCustomerLearnerPortalSearch: false,
        enableLmsConfigurationsScreen: false,
        enableUniversalLink: false,
        enablePortalLearnerCreditManagementScreen: false,
        enableApiCredentialGeneration: false,
        enterpriseFeatures: {},
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

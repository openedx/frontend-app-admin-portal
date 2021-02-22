import portalConfiguration from './portalConfiguration';
import {
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
  CLEAR_PORTAL_CONFIGURATION,
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
  enableAnalyticsScreen: false,
  enableLmsConfigurationsScreen: false,
};

const enterpriseData = {
  uuid: 'd749b244-dceb-47bb-951c-5184a6e6d36a',
  name: 'Test Enterprise',
  slug: 'test-enterprise',
  branding_configuration: {
    enterprise_customer: 'd749b244-dceb-47bb-951c-5184a6e6d36a',
    enterprise_slug: 'test-enterprise',
    logo: 'https://s3...',
  },
  contact_email: 'fake@example.com',
  enable_portal_code_management_screen: true,
  enable_portal_reporting_config_screen: true,
  enable_portal_subscription_management_screen: true,
  enable_portal_saml_configuration_screen: true,
  enable_analytics_screen: true,
  enable_portal_lms_configurations_screen: true,
};

describe('portalConfiguration reducer', () => {
  it('has initial state', () => {
    expect(portalConfiguration(undefined, {})).toEqual(initialState);
  });

  it('updates fetch portal configuration success state', () => {
    const succeededState = { ...initialState };
    succeededState.loading = false;

    const expected = {
      ...succeededState,
      contactEmail: enterpriseData.contact_email,
      enterpriseId: enterpriseData.uuid,
      enterpriseName: enterpriseData.name,
      enterpriseSlug: enterpriseData.slug,
      enterpriseLogo: enterpriseData.branding_configuration.logo,
      enableCodeManagementScreen: enterpriseData.enable_portal_code_management_screen,
      enableReportingConfigScreen: enterpriseData.enable_portal_reporting_config_screen,
      enableSubscriptionManagementScreen: enterpriseData.enable_portal_subscription_management_screen, // eslint-disable-line max-len
      enableSamlConfigurationScreen: enterpriseData.enable_portal_saml_configuration_screen,
      enableAnalyticsScreen: enterpriseData.enable_analytics_screen,
      enableLmsConfigurationsScreen: enterpriseData.enable_portal_lms_configurations_screen,
    };
    expect(portalConfiguration(undefined, {
      type: FETCH_PORTAL_CONFIGURATION_SUCCESS,
      payload: { data: enterpriseData },
    })).toEqual(expected);
  });

  it('updates fetch portal configuration failure state', () => {
    const failedState = { ...initialState };
    failedState.loading = false;
    const error = Error('Network Request');
    const expected = {
      ...failedState,
      error,
    };
    expect(portalConfiguration(undefined, {
      type: FETCH_PORTAL_CONFIGURATION_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('updates clearPortalConfiguration state', () => {
    portalConfiguration(undefined, {
      type: FETCH_PORTAL_CONFIGURATION_SUCCESS,
      payload: { data: enterpriseData },
    });

    expect(portalConfiguration(undefined, {
      type: CLEAR_PORTAL_CONFIGURATION,
    })).toEqual(initialState);
  });
});

import portalConfiguration from './portalConfiguration';
import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
} from '../constants/portalConfiguration';

const initialState = {
  loading: false,
  error: null,
  enterpriseId: null,
  enterpriseSlug: null,
  enterpriseLogo: null,
};

describe('portalConfiguration reducer', () => {
  it('has initial state', () => {
    expect(portalConfiguration(undefined, {})).toEqual(initialState);
  });

  it('updates fetch portalConfiguration request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(portalConfiguration(undefined, {
      type: FETCH_PORTAL_CONFIGURATION_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch portalConfiguration success state', () => {
    const portalConfigurationData = {
      enterprise_customer: 'd749b244-dceb-47bb-951c-5184a6e6d36a',
      enterprise_slug: 'test-enterprise',
      logo: 'https://test.com/media/enterprise/branding/1/1_logo.png',
    };
    const expected = {
      ...initialState,
      enterpriseId: portalConfigurationData.enterprise_customer,
      enterpriseSlug: portalConfigurationData.enterprise_slug,
      enterpriseLogo: portalConfigurationData.logo,
    };
    expect(portalConfiguration(undefined, {
      type: FETCH_PORTAL_CONFIGURATION_SUCCESS,
      payload: { data: portalConfigurationData },
    })).toEqual(expected);
  });

  it('updates fetch portalConfiguration failure state', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(portalConfiguration(undefined, {
      type: FETCH_PORTAL_CONFIGURATION_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });
});

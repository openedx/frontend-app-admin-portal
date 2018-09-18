import portalConfiguration from './portalConfiguration';
import {
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
};

describe('portalConfiguration reducer', () => {
  it('has initial state', () => {
    expect(portalConfiguration(undefined, {})).toEqual(initialState);
  });

  it('updates fetch portal configuration success state', () => {
    const expected = {
      ...initialState,
      enterpriseId: enterpriseData.uuid,
      enterpriseName: enterpriseData.name,
      enterpriseSlug: enterpriseData.slug,
      enterpriseLogo: enterpriseData.branding_configuration.logo,
    };
    expect(portalConfiguration(undefined, {
      type: FETCH_PORTAL_CONFIGURATION_SUCCESS,
      payload: { data: enterpriseData },
    })).toEqual(expected);
  });

  it('updates fetch portal configuration failure state', () => {
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

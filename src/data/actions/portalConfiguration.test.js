import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import fetchPortalConfiguration from './portalConfiguration';
import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
} from '../constants/portalConfiguration';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(axios);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  describe('fetchSiteConfiguration', () => {
    const enterpriseSlug = 'test-enterprise';

    it('dispatches success action after fetching enterprise branding configuration', () => {
      const responseData = {
        enterprise_customer: 'd749b244-dceb-47bb-951c-5184a6e6d36a',
        enterprise_slug: enterpriseSlug,
        logo: 'https://s3...',
      };

      axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer-branding/${enterpriseSlug}/`)
        .replyOnce(200, JSON.stringify(responseData));

      const expectedActions = [
        { type: FETCH_PORTAL_CONFIGURATION_REQUEST },
        {
          type: FETCH_PORTAL_CONFIGURATION_SUCCESS,
          payload: { data: responseData },
        },
      ];
      const store = mockStore();

      return store.dispatch(fetchPortalConfiguration(enterpriseSlug)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    it('dispatches failure action after fetching enterprise branding configuration', () => {
      const expectedActions = [
        { type: FETCH_PORTAL_CONFIGURATION_REQUEST },
        { type: FETCH_PORTAL_CONFIGURATION_FAILURE, payload: { error: Error('Network Error') } },
      ];
      const store = mockStore();

      axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer-branding/${enterpriseSlug}/`)
        .networkError();

      return store.dispatch(fetchPortalConfiguration(enterpriseSlug)).then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});

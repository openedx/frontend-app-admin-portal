import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';

import apiClient from '../apiClient';
import { clearPortalConfiguration, fetchPortalConfiguration } from './portalConfiguration';
import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
  CLEAR_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

const mockStore = configureMockStore([thunk]);
const axiosMock = new MockAdapter(apiClient);
apiClient.isAccessTokenExpired = jest.fn();
apiClient.isAccessTokenExpired.mockReturnValue(false);

describe('actions', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  it('dispatches success action after fetching portalConfiguration', () => {
    const slug = 'test-enterprise';
    const responseData = {
      uuid: 'd749b244-dceb-47bb-951c-5184a6e6d36a',
      name: 'Test Enterprise',
      slug: 'test-enterprise',
      branding_configuration: {
        enterprise_customer: 'd749b244-dceb-47bb-951c-5184a6e6d36a',
        enterprise_slug: 'test-enterprise',
        logo: 'https://s3...',
      },
    };

    const expectedActions = [
      { type: FETCH_PORTAL_CONFIGURATION_REQUEST },
      { type: FETCH_PORTAL_CONFIGURATION_SUCCESS, payload: { data: responseData } },
    ];
    const store = mockStore();
    axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer/dashboard_list/?enterprise_slug=${slug}&page=1&page_size=50`)
      .replyOnce(200, JSON.stringify({ results: [responseData] }));

    return store.dispatch(fetchPortalConfiguration(slug)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('dispatches failure action after failing to fetch portalConfiguration', () => {
    const slug = 'test-enterprise';
    const expectedActions = [
      { type: FETCH_PORTAL_CONFIGURATION_REQUEST },
      { type: FETCH_PORTAL_CONFIGURATION_FAILURE, payload: { error: Error('Request failed with status code 500') } },
    ];
    const store = mockStore();

    axiosMock.onGet(`http://localhost:18000/enterprise/api/v1/enterprise-customer/dashboard_list/?enterprise_slug=${slug}&page=1&page_size=50`)
      .replyOnce(500, JSON.stringify({}));

    return store.dispatch(fetchPortalConfiguration(slug)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('dispatches clearPortalConfiguration action', () => {
    const store = mockStore();
    store.dispatch(clearPortalConfiguration());
    expect(store.getActions()).toEqual([{ type: CLEAR_PORTAL_CONFIGURATION }]);
  });
});

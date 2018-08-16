import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { clearPortalConfiguration, setPortalConfiguration } from './portalConfiguration';
import {
  SET_PORTAL_CONFIGURATION,
  CLEAR_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

const mockStore = configureMockStore([thunk]);

describe('actions', () => {
  it('dispatches setPortalConfiguration action', () => {
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

    const expectedActions = [
      {
        type: SET_PORTAL_CONFIGURATION,
        payload: { data: enterpriseData },
      },
    ];
    const store = mockStore();

    store.dispatch(setPortalConfiguration(enterpriseData));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches clearPortalConfiguration action', () => {
    const store = mockStore();
    store.dispatch(clearPortalConfiguration());
    expect(store.getActions()).toEqual([{ type: CLEAR_PORTAL_CONFIGURATION }]);
  });
});

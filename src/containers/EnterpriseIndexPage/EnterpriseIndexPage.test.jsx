import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';

import EnterpriseIndexPage from './index';

const mockStore = configureMockStore([thunk]);

describe('<EnterpriseIndexPage />', () => {
  let store;
  let wrapper;
  let dispatchSpy;

  const initialState = {
    table: {
      'enterprise-list': {
        loading: false,
        error: null,
        data: {
          count: 3,
          num_pages: 1,
          current_page: 1,
          results: [
            {
              uuid: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
              name: 'Enterprise 1',
              slug: 'enterprise-1',
              active: true,
            },
          ],
        },
      },
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    wrapper = shallow((
      <EnterpriseIndexPage store={store} />
    ));
  });

  it('sets the appropriate props', () => {
    expect(wrapper.props().loading).toEqual(false);
    expect(wrapper.props().error).toEqual(null);
    expect(wrapper.props().enterprises).toEqual(initialState.table['enterprise-list'].data);
  });

  it('searchEnterpriseList dispatches searchEnterpriseList action', () => {
    wrapper.props().searchEnterpriseList();
    // TODO: tohavebeencalledwith?
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('clearPortalConfiguration dispatches clearPortalConfiguration action', () => {
    wrapper.props().clearPortalConfiguration();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('getLocalUser dispatches getLocalUser action', () => {
    wrapper.props().getLocalUser();
    expect(dispatchSpy).toHaveBeenCalled();
  });
});

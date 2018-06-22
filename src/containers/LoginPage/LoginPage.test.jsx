import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow } from 'enzyme';

import LoginPage from './index';

const mockStore = configureMockStore([thunk]);

describe('<LoginPage />', () => {
  let store;
  let wrapper;
  let dispatchSpy;

  beforeEach(() => {
    const initialState = {
      login: {
        loading: false,
        isAuthenticated: true,
        error: null,
      },
    };
    store = mockStore(initialState);
    dispatchSpy = jest.spyOn(store, 'dispatch');
    wrapper = shallow((
      <LoginPage store={store} />
    ));
  });

  it('sets the appropriate props', () => {
    expect(wrapper.props().loading).toEqual(false);
    expect(wrapper.props().isAuthenticated).toEqual(true);
    expect(wrapper.props().error).toEqual(null);
  });

  it('login dispatches login action', () => {
    wrapper.props().login('username', 'password');
    expect(dispatchSpy).toHaveBeenCalled();
  });
});

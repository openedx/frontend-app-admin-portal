import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';

import LogoutHandler from './index';

const mockStore = configureMockStore([thunk]);

describe('<LogoutHandler />', () => {
  it('constructor dispatches logout action', () => {
    const store = mockStore({});
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    mount((
      <MemoryRouter>
        <LogoutHandler store={store} />
      </MemoryRouter>
    ));
    expect(dispatchSpy).toHaveBeenCalled();
  });
});

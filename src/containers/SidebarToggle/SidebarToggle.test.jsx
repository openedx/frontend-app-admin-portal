import React from 'react';
import PropTypes from 'prop-types';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

import SidebarToggle from './index';

import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
} from '../../data/constants/sidebar';

const mockStore = configureMockStore([thunk]);
const initialState = {
  sidebar: {
    isExpandedByToggle: false,
  },
};

const SidebarToggleWrapper = props => (
  <Provider store={props.store}>
    <SidebarToggle
      baseUrl="/test-enterprise-slug"
      {...props}
    />
  </Provider>
);

SidebarToggleWrapper.defaultProps = {
  store: mockStore({
    ...initialState,
  }),
};

SidebarToggleWrapper.propTypes = {
  store: PropTypes.shape({}),
};

describe('<Sidebar />', () => {
  it('renders correctly with menu icon', () => {
    const tree = renderer
      .create((
        <SidebarToggleWrapper />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with close icon', () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
        isExpandedByToggle: true,
      },
    });

    const tree = renderer
      .create((
        <SidebarToggleWrapper store={store} />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('dispatches expandSidebar action', () => {
    const store = mockStore({
      ...initialState,
    });

    const wrapper = mount((
      <SidebarToggleWrapper store={store} />
    ));

    const expectedActions = [{
      type: EXPAND_SIDEBAR,
      payload: { usingToggle: true },
    }];

    store.clearActions();
    wrapper.find('SidebarToggle').simulate('click');
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches collapseSidebar action', () => {
    const store = mockStore({
      ...initialState,
      sidebar: {
        ...initialState.sidebar,
        isExpandedByToggle: true,
      },
    });

    const wrapper = mount((
      <SidebarToggleWrapper store={store} />
    ));

    const expectedActions = [{
      type: COLLAPSE_SIDEBAR,
      payload: { usingToggle: true },
    }];

    store.clearActions();
    wrapper.find('SidebarToggle').simulate('click');
    expect(store.getActions()).toEqual(expectedActions);
  });
});

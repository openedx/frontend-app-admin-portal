import React from 'react';
import PropTypes from 'prop-types';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import '@testing-library/jest-dom';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

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
  it('renders correctly with menu icon', async () => {
    render(<SidebarToggleWrapper />);
    const menuIcon = await screen.findByTestId('menu-icon');
    expect(menuIcon).toBeInTheDocument();
  });

  it('renders correctly with close icon', async () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
        isExpandedByToggle: true,
      },
    });
    render(<SidebarToggleWrapper store={store} />);
    const closeIcon = await screen.findByTestId('close-icon');
    expect(closeIcon).toBeInTheDocument();
  });

  it('dispatches expandSidebar action', async () => {
    const store = mockStore({
      ...initialState,
    });

    render((
      <SidebarToggleWrapper store={store} />
    ));

    const expectedActions = [{
      type: EXPAND_SIDEBAR,
      payload: { usingToggle: true },
    }];

    store.clearActions();
    const toggleButton = await screen.findByTestId('menu-icon');
    fireEvent.click(toggleButton);
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches collapseSidebar action', async () => {
    const store = mockStore({
      ...initialState,
      sidebar: {
        ...initialState.sidebar,
        isExpandedByToggle: true,
      },
    });

    render((
      <SidebarToggleWrapper store={store} />
    ));

    const expectedActions = [{
      type: COLLAPSE_SIDEBAR,
      payload: { usingToggle: true },
    }];

    store.clearActions();
    const toggleButton = await screen.findByTestId('close-icon');
    fireEvent.click(toggleButton);
    expect(store.getActions()).toEqual(expectedActions);
  });
});

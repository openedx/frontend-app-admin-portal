import React from 'react';
import PropTypes from 'prop-types';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

import SidebarToggle from './index';
import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
} from '../../data/constants/sidebar';

jest.mock('@edx/paragon/icons', () => ({
  Close: () => <div data-testid="close-icon" />,
  MenuIcon: () => <div data-testid="menu-icon" />,
}));

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
    render(<SidebarToggleWrapper />);
    expect(screen.getAllByTestId('menu-icon')).toHaveLength(1);
  });

  it('renders correctly with close icon', () => {
    const store = mockStore({
      sidebar: {
        ...initialState.sidebar,
        isExpandedByToggle: true,
      },
    });
    render(<SidebarToggleWrapper store={store} />);
    expect(screen.getAllByTestId('close-icon')).toHaveLength(1);
  });

  it('dispatches expandSidebar action', () => {
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
    fireEvent.click(screen.getByRole('button'));
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

    render((
      <SidebarToggleWrapper store={store} />
    ));

    const expectedActions = [{
      type: COLLAPSE_SIDEBAR,
      payload: { usingToggle: true },
    }];

    store.clearActions();
    fireEvent.click(screen.getByRole('button'));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

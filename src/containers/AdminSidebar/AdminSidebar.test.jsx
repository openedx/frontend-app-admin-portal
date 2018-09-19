import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import AdminSidebar from './index';

const mockStore = configureMockStore([thunk]);

class ContextProvider extends React.Component {
  static childContextTypes = {
    store: PropTypes.object.isRequired,
  }

  static mockStore = mockStore({
    sidebar: {
      expanded: true,
      enabled: true,
    },
  });

  getChildContext = () => ({
    store: ContextProvider.mockStore,
  })

  render() {
    return this.props.children;
  }
}

ContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

describe('<AdminSidebar />', () => {
  let wrapper;
  let dispatchSpy;

  beforeEach(() => {
    dispatchSpy = jest.spyOn(ContextProvider.mockStore, 'dispatch');
    wrapper = mount((
      <MemoryRouter>
        <ContextProvider>
          <AdminSidebar />
        </ContextProvider>
      </MemoryRouter>
    )).find('Sidebar');
  });

  it('sets the appropriate props', () => {
    expect(wrapper.props().sidebarExpanded).toEqual(true);
    expect(wrapper.props().sidebarEnabled).toEqual(true);
  });

  it('toggleSidebar dispatches toggleSidebar action', () => {
    wrapper.props().toggleSidebar();
    expect(dispatchSpy).toHaveBeenCalled();
  });
});

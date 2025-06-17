import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  expandSidebar,
  collapseSidebar,
  toggleSidebarToggle,
} from './sidebar';

import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
  TOGGLE_SIDEBAR_TOGGLE,
} from '../constants/sidebar';

const mockStore = configureMockStore([thunk]);

describe('sidebar actions', () => {
  it('toggle sidebar toggle', () => {
    const expectedActions = [
      { type: TOGGLE_SIDEBAR_TOGGLE },
    ];
    const store = mockStore();
    store.dispatch(toggleSidebarToggle());
    expect(store.getActions()).toEqual(expectedActions);
  });

  describe('expand', () => {
    it('isExpanded', () => {
      const expectedActions = [
        { type: EXPAND_SIDEBAR, payload: { usingToggle: false } },
      ];
      const store = mockStore();
      store.dispatch(expandSidebar());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('isExpandedByToggle', () => {
      const expectedActions = [
        { type: EXPAND_SIDEBAR, payload: { usingToggle: true } },
      ];
      const store = mockStore();
      store.dispatch(expandSidebar(true));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('collapse', () => {
    it('isExpanded', () => {
      const expectedActions = [
        { type: COLLAPSE_SIDEBAR, payload: { usingToggle: false } },
      ];

      const store = mockStore();

      store.dispatch(collapseSidebar());
      expect(store.getActions()).toEqual(expectedActions);
    });

    it('isExpandedByToggle', () => {
      const expectedActions = [
        { type: COLLAPSE_SIDEBAR, payload: { usingToggle: true } },
      ];

      const store = mockStore();

      store.dispatch(collapseSidebar(true));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});

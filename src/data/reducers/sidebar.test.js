import sidebar from './sidebar';
import {
  EXPAND_SIDEBAR,
  COLLAPSE_SIDEBAR,
  TOGGLE_SIDEBAR_TOGGLE,
} from '../constants/sidebar';

const initialState = {
  isExpanded: false,
  isExpandedByToggle: false,
  hasSidebarToggle: false,
};

describe('sidebar reducer', () => {
  it('has initial state', () => {
    expect(sidebar(undefined, {})).toEqual(initialState);
  });

  it('updates hasSidebarToggle state', () => {
    const expected = {
      ...initialState,
      hasSidebarToggle: true,
    };

    expect(sidebar(undefined, {
      type: TOGGLE_SIDEBAR_TOGGLE,
    })).toEqual(expected);
  });

  describe('expand', () => {
    it('updates isExpanded state', () => {
      const expected = {
        ...initialState,
        isExpanded: true,
      };

      expect(sidebar(undefined, {
        type: EXPAND_SIDEBAR,
        payload: {
          usingToggle: false,
        },
      })).toEqual(expected);
    });

    it('updates isExpandedByToggle state', () => {
      const expected = {
        ...initialState,
        isExpandedByToggle: true,
      };

      expect(sidebar(undefined, {
        type: EXPAND_SIDEBAR,
        payload: {
          usingToggle: true,
        },
      })).toEqual(expected);
    });
  });

  describe('collapse', () => {
    it('updates isExpanded state', () => {
      const expected = {
        ...initialState,
        isExpanded: false,
      };

      sidebar(undefined, {
        type: EXPAND_SIDEBAR,
        payload: {
          usingToggle: false,
        },
      });

      expect(sidebar(undefined, {
        type: COLLAPSE_SIDEBAR,
        payload: {
          usingToggle: false,
        },
      })).toEqual(expected);
    });

    it('updates isExpandedByToggle state', () => {
      const expected = {
        ...initialState,
        isExpandedByToggle: false,
      };

      sidebar(undefined, {
        type: EXPAND_SIDEBAR,
        payload: {
          usingToggle: true,
        },
      });

      expect(sidebar(undefined, {
        type: COLLAPSE_SIDEBAR,
        payload: {
          usingToggle: true,
        },
      })).toEqual(expected);
    });
  });
});

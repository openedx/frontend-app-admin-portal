import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';

import CodeManagementPage from './index';

import { COUPONS_REQUEST, CLEAR_COUPONS } from '../../data/constants/coupons';

const mockStore = configureMockStore([thunk]);
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  coupons: {
    loading: false,
    error: null,
    data: {
      count: 0,
      results: [],
    },
  },
  table: {
    'coupon-details': {},
  },
};

const CodeManagementPageWrapper = props => (
  <MemoryRouter>
    <Provider store={props.store}>
      <CodeManagementPage
        location={{}}
        match={{
          path: '/test-page',
        }}
        history={{
          replace: () => {},
        }}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

CodeManagementPageWrapper.defaultProps = {
  store: mockStore({ ...initialState }),
};

CodeManagementPageWrapper.propTypes = {
  store: PropTypes.shape({}),
};

const sampleCouponData = {
  id: 0,
  title: 'test-title-1',
  start_date: '2019-01-03T23:23:51.581Z',
  end_date: '2019-09-18T14:46:36.716Z',
  has_error: false,
  max_uses: 10,
  num_unassigned: 2,
  num_uses: 2,
};

describe('CodeManagementPageWrapper', () => {
  describe('renders', () => {
    it('renders empty results correctly', () => {
      const tree = renderer
        .create((
          <CodeManagementPageWrapper />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders non-empty results correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          data: {
            count: 2,
            num_pages: 1,
            results: [
              sampleCouponData,
              {
                ...sampleCouponData,
                id: 1,
                title: 'test-title-2',
              },
            ],
          },
        },
      });

      const tree = renderer
        .create((
          <CodeManagementPageWrapper store={store} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders loading state correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          loading: true,
        },
      });

      const tree = renderer
        .create((
          <CodeManagementPageWrapper store={store} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders error state correctly', () => {
      const store = mockStore({
        ...initialState,
        coupons: {
          ...initialState.coupons,
          error: new Error('test error'),
        },
      });

      const tree = renderer
        .create((
          <CodeManagementPageWrapper store={store} />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('correctly handles prop changes', () => {
    it('handles location.state change', () => {
      const wrapper = mount(<CodeManagementPageWrapper />);

      wrapper.setProps({
        location: {
          state: {
            hasRequestedCodes: true,
          },
        },
      });

      expect(wrapper.find('CodeManagement').instance().state.hasRequestedCodes).toBeTruthy();
    });
  });

  it('calls clearCouponOrders() on componentWillUnmount', () => {
    const store = mockStore({
      ...initialState,
    });

    const wrapper = mount(<CodeManagementPageWrapper store={store} />);
    wrapper.unmount();

    const actions = store.getActions();
    expect(actions.filter(action => action.type === CLEAR_COUPONS)).toHaveLength(1);
  });

  it('calls expand/collapse callbacks properly', () => {
    const store = mockStore({
      ...initialState,
      coupons: {
        ...initialState.coupons,
        data: {
          count: 1,
          num_pages: 1,
          results: [
            sampleCouponData,
            {
              ...sampleCouponData,
              id: 1,
              title: 'test-title-2',
            },
          ],
        },
      },
      table: {
        'coupon-details': {},
      },
      csv: {
        'coupon-details': {},
      },
    });

    const wrapper = mount(<CodeManagementPageWrapper store={store} />);
    const instance = wrapper.find('CodeManagement').instance();
    const spyExpand = jest.spyOn(instance, 'handleCouponExpand');
    const spyCollapse = jest.spyOn(instance, 'handleCouponCollapse');

    // expand
    wrapper.find('Coupon').first().find('.metadata').simulate('click');
    expect(spyExpand).toBeCalledTimes(1);

    // collapse
    wrapper.find('Coupon').first().find('.metadata').simulate('click');
    expect(spyCollapse).toBeCalledTimes(1);
  });

  it('fetches coupons on refresh button click', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(<CodeManagementPageWrapper store={store} />);
    store.clearActions();
    wrapper.find('.fa-refresh').simulate('click');
    expect(store.getActions().filter(action => action.type === COUPONS_REQUEST)).toHaveLength(1);
  });
});

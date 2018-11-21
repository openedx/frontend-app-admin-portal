import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import Coupon from './index';
import CouponDetails from '../CouponDetails';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  table: {
    'coupon-details': {
      loading: false,
      results: [],
    },
  },
  csv: {
    'coupon-details': {},
  },
});

const initialCouponData = {
  id: 1,
  title: 'Test Coupon',
  start_date: '',
  end_date: '',
  has_error: false,
  num_unassigned: 0,
  num_uses: 0,
  max_uses: 1,
};

const CouponWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <Coupon
        data={initialCouponData}
        {...props}
      />
    </Provider>
  </MemoryRouter>
);

describe('<Coupon />', () => {
  let wrapper;

  describe('renders correctly', () => {
    it('with max uses', () => {
      const tree = renderer
        .create((
          <CouponWrapper />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('without max uses', () => {
      const tree = renderer
        .create((
          <CouponWrapper
            data={{
              ...initialCouponData,
              max_uses: null,
            }}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('with error state', () => {
      const tree = renderer
        .create((
          <CouponWrapper
            data={{
              ...initialCouponData,
              has_error: true,
            }}
          />
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('expands and collapses correctly', () => {
    const simulateCouponClick = () => {
      wrapper.find(Coupon).find('.metadata').simulate('click');
    };

    it('expands on click of collapsed coupon', () => {
      const mockOnExpand = jest.fn();
      wrapper = mount((
        <CouponWrapper
          onExpand={mockOnExpand}
        />
      ));

      simulateCouponClick();
      expect(mockOnExpand).toBeCalledTimes(1);
      expect(wrapper.find(Coupon).find(CouponDetails).prop('expanded')).toBeTruthy();
    });

    it('collapses on click of expanded coupon', () => {
      const mockOnCollapse = jest.fn();
      wrapper = mount((
        <CouponWrapper
          onCollapse={mockOnCollapse}
        />
      ));

      simulateCouponClick();
      expect(wrapper.find(Coupon).find(CouponDetails).prop('expanded')).toBeTruthy();

      simulateCouponClick();
      expect(mockOnCollapse).toBeCalledTimes(1);
      expect(wrapper.find(Coupon).find(CouponDetails).prop('expanded')).toBeFalsy();
    });
  });
});

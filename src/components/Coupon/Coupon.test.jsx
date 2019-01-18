import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
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
  start_date: '2018-06-01T12:00:00Z',
  end_date: '2019-02-01T12:00:00Z',
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

  const simulateCouponClick = () => {
    wrapper.find(Coupon).find('.metadata').simulate('click');
  };

  const simulateCouponKeyDown = (key) => {
    wrapper.find(Coupon).find('.metadata').simulate('keydown', { key });
  };

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
    it('expands on click of collapsed coupon', () => {
      const mockOnExpand = jest.fn();
      wrapper = mount((
        <CouponWrapper
          onExpand={mockOnExpand}
        />
      ));

      simulateCouponClick();
      expect(mockOnExpand).toBeCalledTimes(1);
      expect(wrapper.find(Coupon).find(CouponDetails).prop('isExpanded')).toBeTruthy();
    });

    it('collapses on click of expanded coupon', () => {
      const mockOnCollapse = jest.fn();
      wrapper = mount((
        <CouponWrapper
          onCollapse={mockOnCollapse}
        />
      ));

      simulateCouponClick();
      expect(wrapper.find(Coupon).find(CouponDetails).prop('isExpanded')).toBeTruthy();

      simulateCouponClick();
      expect(mockOnCollapse).toBeCalledTimes(1);
      expect(wrapper.find(Coupon).find(CouponDetails).prop('isExpanded')).toBeFalsy();
    });

    it('expands on keydown of collapsed coupon', () => {
      const mockOnExpand = jest.fn();
      wrapper = mount((
        <CouponWrapper
          onExpand={mockOnExpand}
        />
      ));

      simulateCouponKeyDown('Enter');
      expect(mockOnExpand).toBeCalledTimes(1);
      expect(wrapper.find(Coupon).find(CouponDetails).prop('isExpanded')).toBeTruthy();
    });

    it('collapses on keydown of expanded coupon', () => {
      const mockOnCollapse = jest.fn();
      wrapper = mount((
        <CouponWrapper
          onCollapse={mockOnCollapse}
        />
      ));

      simulateCouponKeyDown('Enter');
      expect(wrapper.find(Coupon).find(CouponDetails).prop('isExpanded')).toBeTruthy();

      simulateCouponKeyDown('Enter');
      expect(mockOnCollapse).toBeCalledTimes(1);
      expect(wrapper.find(Coupon).find(CouponDetails).prop('isExpanded')).toBeFalsy();
    });

    it('does not handle unknown keydown event', () => {
      const mockOnExpandOrOnCollapse = jest.fn();
      const mockOnCollapse = jest.fn();
      wrapper = mount((
        <CouponWrapper
          onCollapse={mockOnExpandOrOnCollapse}
          onExpand={mockOnExpandOrOnCollapse}
        />
      ));

      simulateCouponKeyDown('A');

      expect(mockOnCollapse).toBeCalledTimes(0);
    });
  });

  it('sets state correctly on setCouponOpacity()', () => {
    wrapper = shallow(<CouponWrapper />);
    const instance = wrapper.find(Coupon).dive().instance();

    expect(instance.state.dimmed).toBeFalsy();
    instance.setCouponOpacity(true);
    expect(instance.state.dimmed).toBeTruthy();
  });

  it('sets state correctly on closeCouponDetails()', () => {
    wrapper = shallow(<CouponWrapper />);
    const instance = wrapper.find(Coupon).dive().instance();

    instance.setState({
      isExpanded: true,
    });

    expect(instance.state.isExpanded).toBeTruthy();
    instance.closeCouponDetails(true);
    expect(instance.state.isExpanded).toBeFalsy();
  });
});

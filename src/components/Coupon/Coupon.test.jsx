import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { MULTI_USE } from '../../data/constants/coupons';

import Coupon from './index';
import CouponDetails from '../CouponDetails';

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({
  portalConfiguration: {
    enterpriseId,
  },
  table: {
    'coupon-details': {
      loading: false,
      results: [],
    },
  },
  csv: {
    'coupon-details': {},
  },
  coupons: {
    couponOverviewLoading: false,
    couponOverviewError: null,
  },
});

const initialCouponData = {
  id: 1,
  title: 'Test Coupon',
  start_date: '2018-06-01T12:00:00Z',
  end_date: '2019-02-01T12:00:00Z',
  errors: [],
  num_unassigned: 0,
  num_uses: 0,
  max_uses: 1,
  usage_limitation: MULTI_USE,
};

function CouponWrapper(props) {
  return (
    <MemoryRouter>
      <Provider store={store}>
        <Coupon
          data={initialCouponData}
          {...props}
        />
      </Provider>
    </MemoryRouter>
  );
}

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
              errors: [{ code: 'test-code', user_email: 'test@example.com' }],
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

      wrapper = mount((
        <CouponWrapper
          onCollapse={mockOnExpandOrOnCollapse}
          onExpand={mockOnExpandOrOnCollapse}
        />
      ));

      simulateCouponKeyDown('A');

      expect(mockOnExpandOrOnCollapse).toBeCalledTimes(0);
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

  it('sets state correctly for isExpanded prop on componentDidMount', () => {
    wrapper = mount(<CouponWrapper isExpanded />);
    expect(wrapper.find(Coupon).instance().state.isExpanded).toBeTruthy();
  });

  it('correctly handles isExpanded prop change', () => {
    wrapper = mount(<CouponWrapper />);
    expect(wrapper.find(Coupon).instance().state.isExpanded).toBeFalsy();

    wrapper.setProps({
      isExpanded: true,
    });

    expect(wrapper.find(Coupon).instance().state.isExpanded).toBeTruthy();
  });
});

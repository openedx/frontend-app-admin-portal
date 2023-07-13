import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { screen } from '@testing-library/react';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { shallow } from '@edx/react-unit-test-utils';

import { MULTI_USE } from '../../data/constants/coupons';

import Coupon from './index';

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

const CouponWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <Coupon
          data={initialCouponData}
          {...props}
        />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<Coupon />', () => {
  describe('renders correctly', () => {
    it('with max uses', () => {
      const coupon = shallow(<CouponWrapper />);
      expect(coupon.snapshot).toMatchSnapshot();
    });

    it('without max uses', () => {
      const coupon = shallow(<CouponWrapper data={{
        ...initialCouponData, max_uses: null,
      }}/>);
      expect(coupon.snapshot).toMatchSnapshot();
    });

    it('with error state', () => {
      const coupon = shallow(<CouponWrapper data={{
        ...initialCouponData, errors: [{ code: 'test-code', user_email: 'test@example.com' }],
      }}/>);
      expect(coupon.snapshot).toMatchSnapshot();
    });
  });

  describe('expands and collapses correctly', () => {
    it('expands on click of collapsed coupon', async () => {
      const mockOnExpand = jest.fn();
      render(<CouponWrapper onExpand={mockOnExpand} />);
      await waitFor(() => {
        userEvent.click(screen.getByText(initialCouponData.title));
        expect(mockOnExpand).toBeCalledTimes(1);
      });
    });

    it('collapses on click of expanded coupon', async () => {
      const mockOnCollapse = jest.fn();
      render(<CouponWrapper onCollapse={mockOnCollapse} />);
      await waitFor(() => {
        userEvent.click(screen.getByText(initialCouponData.title));
        expect(mockOnCollapse).toBeCalledTimes(1);
      });
    });

    it('expands on keydown of expanded coupon', () => {
      const mockOnExpand = jest.fn();
      render(<CouponWrapper onExpand={mockOnExpand} />);
      screen.debug();
      fireEvent.keyDown(screen.getByRole('button'), {key: 'Enter', code: 'Enter', charCode: 13})
      expect(mockOnExpand).toBeCalledTimes(1);
    });

    it('collapses on keydown of expanded coupon', () => {
      const mockOnCollapse = jest.fn();
      render(<CouponWrapper onCollapse={mockOnCollapse} />);
      
      fireEvent.keyDown(screen.getByRole('button'), {key: 'Enter', code: 'Enter', charCode: 13})
      fireEvent.keyDown(screen.getAllByRole('button')[0], {key: 'Enter', code: 'Enter', charCode: 13})
      expect(mockOnCollapse).toBeCalledTimes(1);
    });

    it('does not handle unknown keydown event', () => {
      const mockOnExpandOrOnCollapse = jest.fn();

      render(<CouponWrapper 
        onExpand={mockOnExpandOrOnCollapse}
        onCollapse={mockOnExpandOrOnCollapse} />);

      fireEvent.keyDown(screen.getByRole('button'), {key: 'A', code: 'KeyA'})
      expect(mockOnExpandOrOnCollapse).toBeCalledTimes(0);
    });
  });
});

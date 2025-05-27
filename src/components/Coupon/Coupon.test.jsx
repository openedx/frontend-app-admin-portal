import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import renderer from 'react-test-renderer';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

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
      const coupon = renderer.create((<CouponWrapper />)).toJSON();
      expect(coupon).toMatchSnapshot();
    });

    it('without max uses', () => {
      const coupon = renderer
        .create(
          <CouponWrapper
            data={{
              ...initialCouponData,
              max_uses: null,
            }}
          />,
        )
        .toJSON();
      expect(coupon).toMatchSnapshot();
    });

    it('with error state', () => {
      const coupon = renderer
        .create(
          <CouponWrapper
            data={{
              ...initialCouponData,
              errors: [{ code: 'test-code', user_email: 'test@example.com' }],
            }}
          />,
        )
        .toJSON();
      expect(coupon).toMatchSnapshot();
    });
  });

  describe('expands and collapses correctly', () => {
    it('expands on click of collapsed coupon', async () => {
      const user = userEvent.setup();
      const mockOnExpand = jest.fn();
      render(<CouponWrapper onExpand={mockOnExpand} />);
      await user.click(screen.getByText(initialCouponData.title));
      expect(mockOnExpand).toBeCalledTimes(1);
    });

    it('collapses on click of expanded coupon', async () => {
      const user = userEvent.setup();
      const mockOnCollapse = jest.fn();
      render(<CouponWrapper onCollapse={mockOnCollapse} />);
      await user.click(screen.getByText(initialCouponData.title));
      await user.click(screen.getByText(initialCouponData.title));
      expect(mockOnCollapse).toBeCalledTimes(1);
    });

    it('expands on keydown of expanded coupon', async () => {
      const user = userEvent.setup();
      const mockOnExpand = jest.fn();
      render(<CouponWrapper onExpand={mockOnExpand} />);
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{enter}');
      expect(mockOnExpand).toBeCalledTimes(1);
    });

    it('collapses on keydown of expanded coupon', async () => {
      const user = userEvent.setup();
      const mockOnCollapse = jest.fn();
      render(<CouponWrapper onCollapse={mockOnCollapse} />);

      const button1 = screen.getByRole('button');
      button1.focus();
      await user.keyboard('{enter}');
      const button2 = screen.getAllByRole('button')[0];
      button2.focus();
      await user.keyboard('{enter}');
      expect(mockOnCollapse).toBeCalledTimes(1);
    });

    it('does not handle unknown keydown event', async () => {
      const user = userEvent.setup();
      const mockOnExpandOrOnCollapse = jest.fn();

      render(
        <CouponWrapper
          onExpand={mockOnExpandOrOnCollapse}
          onCollapse={mockOnExpandOrOnCollapse}
        />,
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('a');
      expect(mockOnExpandOrOnCollapse).toBeCalledTimes(0);
    });
  });
});

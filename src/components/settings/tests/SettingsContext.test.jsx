/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  screen,
  render,
} from '@testing-library/react';
import SettingsContextProvider from '../SettingsContext';
import * as couponActions from '../../../data/actions/coupons';
import * as hooks from '../data/hooks';

jest.mock('../../../data/actions/coupons');
jest.mock('../data/hooks');

const mockStore = configureMockStore([thunk]);
const ENTERPRISE_SLUG = 'sluggy';
const initialState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-uuid',
    enterpriseSlug: ENTERPRISE_SLUG,
  },
  coupons: {
    loading: false,
  },
};

const SettingsContextProviderWrapper = (props) => (
  <Provider store={mockStore(props.state)}>
    <SettingsContextProvider>
      children
    </SettingsContextProvider>
  </Provider>
);

describe('<SettingsContextProvider/>', () => {
  beforeEach(() => {
    couponActions.fetchCouponOrders.mockReturnValue({
      type: 'fetch coupons',
    });
    hooks.useCustomerAgreementData.mockReturnValue({
      customerAgreement: {
        subscriptions: [{ uuid: 'subscription-uuid' }],
      },
    });
  });

  it('should fetch coupons and render children', () => {
    render(
      <SettingsContextProviderWrapper state={initialState} />,
    );
    expect(couponActions.fetchCouponOrders).toHaveBeenCalled();
    expect(screen.getByText('children'));
  });

  it('should render <LoadingMessage /> if loading coupons', () => {
    render(
      <SettingsContextProviderWrapper
        state={{
          ...initialState,
          coupons: {
            loading: true,
          },
        }}
      />,
    );
    expect(couponActions.fetchCouponOrders).toHaveBeenCalled();
    expect(screen.getByText('Loading...'));
  });

  it('should render <LoadingMessage /> if loading customer agreement', () => {
    hooks.useCustomerAgreementData.mockReturnValue({
      customerAgreement: {
        subscriptions: [],
      },
      loadingCustomerAgreement: true,
    });
    render(<SettingsContextProviderWrapper state={initialState} />);
    expect(screen.getByText('Loading...'));
  });
});

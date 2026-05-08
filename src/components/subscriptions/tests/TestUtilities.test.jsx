import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import {
  mockUseSubscriptionData,
  mockUseSubscriptionUsers,
  generateUseSubscriptionData,
  generateSubscriptionPlan,
  MockSubscriptionContext,
  mockSubscriptionHooks,
  SUBSCRIPTION_PLAN_ZERO_STATE,
} from './TestUtilities';

describe('TestUtilities', () => {
  describe('mockUseSubscriptionData', () => {
    it('returns callable setErrors and forceRefresh callbacks', () => {
      const result = mockUseSubscriptionData(SUBSCRIPTION_PLAN_ZERO_STATE);
      expect(() => result.setErrors()).not.toThrow();
      expect(() => result.forceRefresh()).not.toThrow();
    });
  });

  describe('mockUseSubscriptionUsers', () => {
    it('returns callable setter function as second element', () => {
      const result = mockUseSubscriptionUsers(SUBSCRIPTION_PLAN_ZERO_STATE);
      expect(() => result[1]()).not.toThrow();
    });
  });

  describe('generateUseSubscriptionData', () => {
    it('applies default forceRefresh and isLoading when not provided', () => {
      const plan = generateSubscriptionPlan();
      const result = generateUseSubscriptionData(plan);
      expect(result.loading).toBe(false);
      expect(result.subscriptions.results).toHaveLength(1);
    });

    it('returns callable setErrors callback', () => {
      const plan = generateSubscriptionPlan();
      const result = generateUseSubscriptionData(plan);
      expect(() => result.setErrors()).not.toThrow();
    });
  });

  describe('MockSubscriptionContext', () => {
    it('renders children using default store when store prop is omitted', () => {
      const plan = generateSubscriptionPlan();
      mockSubscriptionHooks(plan);
      render(
        <IntlProvider locale="en">
          <MockSubscriptionContext subscriptionPlan={plan}>
            <div>test content</div>
          </MockSubscriptionContext>
        </IntlProvider>,
      );
      expect(screen.getByText('test content')).toBeInTheDocument();
    });
  });
});

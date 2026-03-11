import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import BillingPage from '../BillingPage';
import * as hooks from '../data/hooks';

// Mock all the hooks
jest.mock('../data/hooks');

// Mock child components to simplify testing
jest.mock('../BillingAddress', () => function MockBillingAddress() {
  return <div data-testid="billing-address">Billing Address Component</div>;
});

jest.mock('../PaymentMethodList', () => function MockPaymentMethodList({ onAddPaymentMethod, onSetDefault }) {
  return (
    <div data-testid="payment-method-list">
      <button type="button" onClick={onAddPaymentMethod}>Add Payment Method</button>
      <button type="button" onClick={() => onSetDefault('pm_test_123')}>Set Default</button>
      Payment Method List Component
    </div>
  );
});

jest.mock('../TransactionHistory', () => function MockTransactionHistory() {
  return <div data-testid="transaction-history">Transaction History Component</div>;
});

jest.mock('../SubscriptionLifecycle', () => function MockSubscriptionLifecycle() {
  return <div data-testid="subscription-lifecycle">Subscription Lifecycle Component</div>;
});

jest.mock('../AddPaymentMethodModal', () => function MockAddPaymentMethodModal({ isOpen, onClose }) {
  return isOpen ? (
    <div data-testid="add-payment-method-modal">
      <button type="button" onClick={onClose}>Close Modal</button>
      Add Payment Method Modal
    </div>
  ) : null;
});

jest.mock('../BillingAddressModal', () => function MockBillingAddressModal({ isOpen, onClose }) {
  return isOpen ? (
    <div data-testid="billing-address-modal">
      <button type="button" onClick={onClose}>Close Modal</button>
      Billing Address Modal
    </div>
  ) : null;
});

jest.mock('../DeletePaymentMethodModal', () => function MockDeletePaymentMethodModal({ isOpen, onClose }) {
  return isOpen ? (
    <div data-testid="delete-payment-method-modal">
      <button type="button" onClick={onClose}>Close Modal</button>
      Delete Payment Method Modal
    </div>
  ) : null;
});

jest.mock('../StripeProvider', () => function MockStripeProvider({ children }) {
  return <div data-testid="stripe-provider">{children}</div>;
});

jest.mock('../SetDefaultSuccessToast', () => function MockSetDefaultSuccessToast({ show }) {
  return show ? <div data-testid="success-toast">Success Toast</div> : null;
});

jest.mock('../SetDefaultErrorToast', () => function MockSetDefaultErrorToast({ show }) {
  return show ? <div data-testid="error-toast">Error Toast</div> : null;
});

jest.mock('../../Hero', () => function MockHero({ title }) {
  return <div data-testid="hero">{title}</div>;
});

const mockMutateAsync = jest.fn();

const defaultHookValues = {
  useSubscription: {
    data: {
      status: 'active',
      planType: 'Teams',
    },
    isLoading: false,
  },
  usePaymentMethods: {
    data: [
      {
        id: 'pm_123',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        isDefault: true,
        status: 'verified',
      },
    ],
    isLoading: false,
  },
  useBillingAddress: {
    data: {
      organizationName: 'Test Org',
      email: 'test@example.com',
      line1: '123 Main St',
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
      country: 'US',
    },
    isLoading: false,
  },
  useSetDefaultPaymentMethod: {
    mutateAsync: mockMutateAsync,
    isLoading: false,
  },
};

const setupMocks = (overrides = {}) => {
  hooks.useSubscription.mockReturnValue({
    ...defaultHookValues.useSubscription,
    ...overrides.useSubscription,
  });
  hooks.usePaymentMethods.mockReturnValue({
    ...defaultHookValues.usePaymentMethods,
    ...overrides.usePaymentMethods,
  });
  hooks.useBillingAddress.mockReturnValue({
    ...defaultHookValues.useBillingAddress,
    ...overrides.useBillingAddress,
  });
  hooks.useSetDefaultPaymentMethod.mockReturnValue({
    ...defaultHookValues.useSetDefaultPaymentMethod,
    ...overrides.useSetDefaultPaymentMethod,
  });
};

const renderBillingPage = (enterpriseId = 'test-enterprise-123') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return renderWithRouter(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <BillingPage enterpriseId={enterpriseId} />
      </IntlProvider>
    </QueryClientProvider>,
  );
};

describe('BillingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  describe('Loading State', () => {
    it('does not display main content when data is loading', () => {
      setupMocks({
        useSubscription: { data: undefined, isLoading: true },
        usePaymentMethods: { data: undefined, isLoading: true },
        useBillingAddress: { data: undefined, isLoading: true },
      });

      renderBillingPage();

      // Should not show main content sections
      expect(screen.queryByTestId('billing-address')).not.toBeInTheDocument();
      expect(screen.queryByTestId('payment-method-list')).not.toBeInTheDocument();
      expect(screen.queryByTestId('transaction-history')).not.toBeInTheDocument();
      expect(screen.queryByTestId('subscription-lifecycle')).not.toBeInTheDocument();

      // Should not show empty state
      expect(screen.queryByText(/Set up your billing information/i)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no payment methods and no billing address', () => {
      setupMocks({
        usePaymentMethods: { data: [], isLoading: false },
        useBillingAddress: { data: null, isLoading: false },
      });

      renderBillingPage();

      expect(screen.getByText(/Set up your billing information/i)).toBeInTheDocument();
      expect(screen.getByText(/Add a payment method and billing address/i)).toBeInTheDocument();
    });

    it('displays empty state when billing address has missing required fields', () => {
      setupMocks({
        usePaymentMethods: { data: [], isLoading: false },
        useBillingAddress: {
          data: {
            organizationName: 'Test Org',
            email: 'test@example.com',
            line1: '', // Missing required field
            city: '',
            postalCode: '',
            country: '',
          },
          isLoading: false,
        },
      });

      renderBillingPage();

      expect(screen.getByText(/Set up your billing information/i)).toBeInTheDocument();
    });

    it('does not display empty state when payment methods exist', () => {
      setupMocks({
        usePaymentMethods: {
          data: [{
            id: 'pm_123', type: 'card', brand: 'visa', last4: '4242',
          }],
          isLoading: false,
        },
        useBillingAddress: { data: null, isLoading: false },
      });

      renderBillingPage();

      expect(screen.queryByText(/Set up your billing information/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('payment-method-list')).toBeInTheDocument();
    });

    it('does not display empty state when billing address exists', () => {
      setupMocks({
        usePaymentMethods: { data: [], isLoading: false },
        useBillingAddress: {
          data: {
            line1: '123 Main St',
            city: 'Boston',
            postalCode: '02101',
            country: 'US',
          },
          isLoading: false,
        },
      });

      renderBillingPage();

      expect(screen.queryByText(/Set up your billing information/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('billing-address')).toBeInTheDocument();
    });
  });

  describe('Past-Due Alert', () => {
    it('displays alert when subscription status is past_due', () => {
      setupMocks({
        useSubscription: {
          data: { status: 'past_due', planType: 'Teams' },
          isLoading: false,
        },
      });

      renderBillingPage();

      expect(screen.getByText(/Your payment failed/i)).toBeInTheDocument();
    });

    it('does not display alert when subscription status is active', () => {
      setupMocks({
        useSubscription: {
          data: { status: 'active', planType: 'Teams' },
          isLoading: false,
        },
      });

      renderBillingPage();

      expect(screen.queryByText(/Your payment failed/i)).not.toBeInTheDocument();
    });
  });

  describe('Populated State', () => {
    it('renders all billing sections when data is available', () => {
      renderBillingPage();

      expect(screen.getByTestId('billing-address')).toBeInTheDocument();
      expect(screen.getByTestId('payment-method-list')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-history')).toBeInTheDocument();
      expect(screen.getByTestId('subscription-lifecycle')).toBeInTheDocument();
    });
  });

  describe('Add Payment Method Modal', () => {
    it('opens modal when Add Payment Method is clicked', async () => {
      const user = userEvent.setup();
      renderBillingPage();

      // Modal should not be visible initially
      expect(screen.queryByTestId('add-payment-method-modal')).not.toBeInTheDocument();

      // Click the Add Payment Method button
      const addButton = screen.getByText('Add Payment Method');
      await user.click(addButton);

      // Modal should be visible
      expect(screen.getByTestId('add-payment-method-modal')).toBeInTheDocument();
    });

    it('closes modal when Close Modal is clicked', async () => {
      const user = userEvent.setup();
      renderBillingPage();

      // Open the modal
      const addButton = screen.getByText('Add Payment Method');
      await user.click(addButton);
      expect(screen.getByTestId('add-payment-method-modal')).toBeInTheDocument();

      // Close the modal
      const closeButton = screen.getByText('Close Modal');
      await user.click(closeButton);

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('add-payment-method-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Set Default Payment Method', () => {
    it('shows success toast when set default succeeds', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderBillingPage();

      // Verify toast not visible initially
      expect(screen.queryByTestId('success-toast')).not.toBeInTheDocument();

      // Click the Set Default button
      const setDefaultButton = screen.getByText('Set Default');
      await user.click(setDefaultButton);

      // Verify success toast is now visible
      await waitFor(() => {
        expect(screen.getByTestId('success-toast')).toBeInTheDocument();
      });
    });

    it('shows error toast when set default fails', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error('API Error'));
      renderBillingPage();

      // Verify toast not visible initially
      expect(screen.queryByTestId('error-toast')).not.toBeInTheDocument();

      // Click the Set Default button
      const setDefaultButton = screen.getByText('Set Default');
      await user.click(setDefaultButton);

      // Verify error toast is now visible
      await waitFor(() => {
        expect(screen.getByTestId('error-toast')).toBeInTheDocument();
      });
    });
  });

  describe('EnterpriseId Prop', () => {
    it('passes enterpriseId to all hook calls', () => {
      const testEnterpriseId = 'enterprise-456';
      renderBillingPage(testEnterpriseId);

      expect(hooks.useSubscription).toHaveBeenCalledWith(testEnterpriseId);
      expect(hooks.usePaymentMethods).toHaveBeenCalledWith(testEnterpriseId);
      expect(hooks.useBillingAddress).toHaveBeenCalledWith(testEnterpriseId);
    });

    it('handles empty enterpriseId gracefully', () => {
      renderBillingPage('');

      expect(hooks.useSubscription).toHaveBeenCalledWith('');
      expect(hooks.usePaymentMethods).toHaveBeenCalledWith('');
      expect(hooks.useBillingAddress).toHaveBeenCalledWith('');
    });
  });
});

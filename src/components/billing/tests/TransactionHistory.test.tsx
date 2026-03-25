import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import TransactionHistory from '../TransactionHistory';
import * as hooks from '../data/hooks';

jest.mock('../data/hooks');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

const mockTransactionsWithActions = {
  results: [
    {
      id: 'inv_1',
      created: 1705276800,
      description: 'Subscription payment',
      amount: 1000,
      currency: 'usd',
      status: 'paid',
      invoicePdf: 'https://example.com/invoice.pdf',
      receiptUrl: 'https://example.com/receipt.pdf',
    },
  ],
  hasMore: false,
  nextPageToken: null,
};

const renderTransactionHistory = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en">
        <TransactionHistory enterpriseUuid={TEST_ENTERPRISE_UUID} />
      </IntlProvider>
    </QueryClientProvider>,
  );
};

describe('TransactionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('dropdown z-index fix', () => {
    it('applies fix class to dropdown menu for proper stacking', async () => {
      const user = userEvent.setup();
      (hooks.useTransactions as jest.Mock).mockReturnValue({
        data: mockTransactionsWithActions,
        isLoading: false,
      });

      renderTransactionHistory();

      // Click the actions dropdown toggle
      const actionsButton = screen.getByRole('button', { name: /actions menu/i });
      await user.click(actionsButton);

      // The dropdown menu should have the fix class for z-index and translateZ
      const dropdownMenu = document.querySelector('.transaction-actions-dropdown-menu');
      expect(dropdownMenu).toBeInTheDocument();
    });
  });
});

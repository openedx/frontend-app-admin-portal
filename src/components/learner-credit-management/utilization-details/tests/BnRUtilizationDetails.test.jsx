import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import BnRUtilizationDetails from '../BnRUtilizationDetails';
import { renderWithI18nProvider } from '../../../test/testUtils';

jest.mock('../../data', () => ({
  formatPrice: jest.fn((price) => `$${price.toLocaleString()}`),
}));

describe('<BnRUtilizationDetails />', () => {
  const mockRenderActivityLink = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    budgetAggregates: {
      amountAllocatedUsd: 3000,
      amountRedeemedUsd: 1200,
    },
    renderActivityLink: mockRenderActivityLink,
  };

  it('renders with basic props', () => {
    renderWithI18nProvider(<BnRUtilizationDetails {...defaultProps} />);

    expect(screen.getByText('Amount pending')).toBeInTheDocument();
    expect(screen.getByText('Amount spent')).toBeInTheDocument();
    expect(screen.getByTestId('budget-utilization-pending')).toBeInTheDocument();
    expect(screen.getByTestId('budget-utilization-spent')).toBeInTheDocument();
  });

  it('displays formatted prices correctly', () => {
    renderWithI18nProvider(<BnRUtilizationDetails {...defaultProps} />);

    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
  });

  it('calls renderActivityLink with correct parameters for pending amount', () => {
    renderWithI18nProvider(<BnRUtilizationDetails {...defaultProps} />);

    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 3000,
      type: 'approved-requests',
    });
  });

  it('calls renderActivityLink with correct parameters for spent amount', () => {
    renderWithI18nProvider(<BnRUtilizationDetails {...defaultProps} />);

    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 1200,
      type: 'spent',
    });
  });

  it('calls renderActivityLink twice (once for each amount)', () => {
    renderWithI18nProvider(<BnRUtilizationDetails {...defaultProps} />);

    expect(mockRenderActivityLink).toHaveBeenCalledTimes(2);
  });

  it('renders with zero values', () => {
    const propsWithZeroValues = {
      budgetAggregates: {
        amountAllocatedUsd: 0,
        amountRedeemedUsd: 0,
      },
      renderActivityLink: mockRenderActivityLink,
    };

    renderWithI18nProvider(<BnRUtilizationDetails {...propsWithZeroValues} />);

    expect(screen.getAllByText('$0')).toHaveLength(2);
    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 0,
      type: 'approved-requests',
    });
    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 0,
      type: 'spent',
    });
  });

  it('renders with only pending amount', () => {
    const propsWithOnlyPending = {
      budgetAggregates: {
        amountAllocatedUsd: 4500,
        amountRedeemedUsd: 0,
      },
      renderActivityLink: mockRenderActivityLink,
    };

    renderWithI18nProvider(<BnRUtilizationDetails {...propsWithOnlyPending} />);

    expect(screen.getByText('$4,500')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('renders with only spent amount', () => {
    const propsWithOnlySpent = {
      budgetAggregates: {
        amountAllocatedUsd: 0,
        amountRedeemedUsd: 2800,
      },
      renderActivityLink: mockRenderActivityLink,
    };

    renderWithI18nProvider(<BnRUtilizationDetails {...propsWithOnlySpent} />);

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$2,800')).toBeInTheDocument();
  });

  it('renders utilization description for Browse and Request', () => {
    renderWithI18nProvider(<BnRUtilizationDetails {...defaultProps} />);

    expect(screen.getByText(/Your total utilization includes both pending funds/)).toBeInTheDocument();
  });

  it('renders with decimal values', () => {
    const propsWithDecimals = {
      budgetAggregates: {
        amountAllocatedUsd: 2345.67,
        amountRedeemedUsd: 876.54,
      },
      renderActivityLink: mockRenderActivityLink,
    };

    renderWithI18nProvider(<BnRUtilizationDetails {...propsWithDecimals} />);

    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 2345.67,
      type: 'approved-requests',
    });
    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 876.54,
      type: 'spent',
    });
  });
});

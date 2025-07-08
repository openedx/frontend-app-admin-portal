import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import AssignedUtilizationDetails from '../AssignedUtilizationDetails';
import { renderWithI18nProvider } from '../../../test/testUtils';

jest.mock('../../data', () => ({
  formatPrice: jest.fn((price) => `$${price.toLocaleString()}`),
}));

describe('<AssignedUtilizationDetails />', () => {
  const mockRenderActivityLink = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    budgetAggregates: {
      amountAllocatedUsd: 5000,
      amountRedeemedUsd: 2000,
    },
    renderActivityLink: mockRenderActivityLink,
  };

  it('renders with basic props', () => {
    renderWithI18nProvider(<AssignedUtilizationDetails {...defaultProps} />);

    expect(screen.getByText('Amount assigned')).toBeInTheDocument();
    expect(screen.getByText('Amount spent')).toBeInTheDocument();
    expect(screen.getByTestId('budget-utilization-assigned')).toBeInTheDocument();
    expect(screen.getByTestId('budget-utilization-spent')).toBeInTheDocument();
  });

  it('displays formatted prices correctly', () => {
    renderWithI18nProvider(<AssignedUtilizationDetails {...defaultProps} />);

    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$2,000')).toBeInTheDocument();
  });

  it('calls renderActivityLink with correct parameters for assigned amount', () => {
    renderWithI18nProvider(<AssignedUtilizationDetails {...defaultProps} />);

    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 5000,
      type: 'assigned',
    });
  });

  it('calls renderActivityLink with correct parameters for spent amount', () => {
    renderWithI18nProvider(<AssignedUtilizationDetails {...defaultProps} />);

    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 2000,
      type: 'spent',
    });
  });

  it('calls renderActivityLink twice (once for each amount)', () => {
    renderWithI18nProvider(<AssignedUtilizationDetails {...defaultProps} />);

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

    renderWithI18nProvider(<AssignedUtilizationDetails {...propsWithZeroValues} />);

    expect(screen.getAllByText('$0')).toHaveLength(2);
    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 0,
      type: 'assigned',
    });
    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 0,
      type: 'spent',
    });
  });

  it('renders with only allocated amount', () => {
    const propsWithOnlyAllocated = {
      budgetAggregates: {
        amountAllocatedUsd: 3000,
        amountRedeemedUsd: 0,
      },
      renderActivityLink: mockRenderActivityLink,
    };

    renderWithI18nProvider(<AssignedUtilizationDetails {...propsWithOnlyAllocated} />);

    expect(screen.getByText('$3,000')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('renders with only redeemed amount', () => {
    const propsWithOnlyRedeemed = {
      budgetAggregates: {
        amountAllocatedUsd: 0,
        amountRedeemedUsd: 1500,
      },
      renderActivityLink: mockRenderActivityLink,
    };

    renderWithI18nProvider(<AssignedUtilizationDetails {...propsWithOnlyRedeemed} />);

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$1,500')).toBeInTheDocument();
  });

  it('renders utilization description', () => {
    renderWithI18nProvider(<AssignedUtilizationDetails {...defaultProps} />);

    expect(screen.getByText(/Your total utilization includes both assigned funds/)).toBeInTheDocument();
  });

  it('has correct data-testid attributes', () => {
    renderWithI18nProvider(<AssignedUtilizationDetails {...defaultProps} />);

    const assignedElement = screen.getByTestId('budget-utilization-assigned');
    const spentElement = screen.getByTestId('budget-utilization-spent');

    expect(assignedElement).toHaveTextContent('$5,000');
    expect(spentElement).toHaveTextContent('$2,000');
  });

  it('renders with decimal values', () => {
    const propsWithDecimals = {
      budgetAggregates: {
        amountAllocatedUsd: 1234.56,
        amountRedeemedUsd: 987.65,
      },
      renderActivityLink: mockRenderActivityLink,
    };

    renderWithI18nProvider(<AssignedUtilizationDetails {...propsWithDecimals} />);

    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 1234.56,
      type: 'assigned',
    });
    expect(mockRenderActivityLink).toHaveBeenCalledWith({
      amount: 987.65,
      type: 'spent',
    });
  });
});

import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';

import LearnerCreditAggregateCards from '../LearnerCreditAggregateCards';

describe('<LearnerCreditAggregateCards />', () => {
  it('renders loading state', () => {
    render(<LearnerCreditAggregateCards isLoading />);
    const expectedSkeletonCount = 3;
    for (let i = 1; i <= expectedSkeletonCount; i++) {
      expect(screen.getByTestId(`loading-skeleton-card-${i}`));
    }
  });

  it('renders with non-zero total funds', () => {
    const props = {
      totalFunds: 5000,
      percentUtilized: 0.04,
      remainingFunds: 4800,
      redeemedFunds: 200,
    };
    render(<LearnerCreditAggregateCards {...props} />);

    expect(screen.getByText('Percentage Utilized'));
    expect(screen.getByText(`${(props.percentUtilized * 100).toFixed(1)}%`, {
      exact: false,
    }));

    expect(screen.getByText('Remaining Funds'));
    expect(screen.getByText(`$${props.remainingFunds.toLocaleString()}`, {
      exact: false,
    }));

    expect(screen.getByText('Total Funds'));
    expect(screen.getByText(`$${props.totalFunds.toLocaleString()}`, {
      exact: false,
    }));

    expect(screen.getByText('Redeemed Funds'));
    expect(screen.getByText(`$${props.redeemedFunds.toLocaleString()}`, {
      exact: false,
    }));
  });

  it('renders with $0 total funds', () => {
    const props = {
      totalFunds: 0,
      percentUtilized: 0,
      remainingFunds: 0,
      redeemedFunds: 0,
    };
    render(<LearnerCreditAggregateCards {...props} />);

    expect(screen.getByText('Percentage Utilized'));
    expect(screen.getByText('Remaining Funds'));
    expect(screen.getByText('Total Funds'));
    expect(screen.getByText('Redeemed Funds'));

    expect(screen.getAllByText('$0', { exact: false })).toHaveLength(3);
  });

  it('renders with non-zero redeemed funds only', () => {
    const props = {
      redeemedFunds: 200,
    };
    render(<LearnerCreditAggregateCards {...props} />);
    expect(screen.getByText('Total Spend'));
    expect(screen.getByText(`$${props.redeemedFunds.toLocaleString()}`, {
      exact: false,
    }));
  });

  it('renders with $0 redeemed funds only', () => {
    const props = {
      redeemedFunds: 0,
    };
    render(<LearnerCreditAggregateCards {...props} />);
    expect(screen.getByText('Total Spend'));
    expect(screen.getByText(`$${props.redeemedFunds.toLocaleString()}`, {
      exact: false,
    }));
  });

  it('returns null if total funds or redeemeded funds is not provided', () => {
    const { container } = render(<LearnerCreditAggregateCards />);
    expect(container.firstChild).toBeNull();
  });
});

import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { renderWithRouter } from '../../test/testUtils';

import MultipleSubscriptionsPicker, { DEFAULT_LEAD_TEXT } from '../MultipleSubscriptionPicker';

const defaultProps = {
  enterpriseSlug: 'sluggy',
  subscriptions: [
    {
      uuid: 'ided',
      title: 'Enterprise A',
      startDate: '2021-04-13',
      expirationDate: '2024-04-13',
      licenses: {
        allocated: 10,
        total: 20,
      },
    },
    {
      uuid: 'anotherid',
      title: 'Enterprise B',
      startDate: '2021-03-13',
      expirationDate: '2024-10-13',
      licenses: {
        allocated: 11,
        total: 30,
      },
    },
  ],
};

describe('MultipleSubscriptionsPicker', () => {
  it('displays a title', () => {
    renderWithRouter(<MultipleSubscriptionsPicker {...defaultProps} />);
    expect(screen.getByText('Cohorts')).toBeInTheDocument();
  });
  it('displays default lead text by default', () => {
    renderWithRouter(<MultipleSubscriptionsPicker {...defaultProps} />);
    expect(screen.getByText(DEFAULT_LEAD_TEXT)).toBeInTheDocument();
  });
  it('displays an alternate lead text', () => {
    const leadText = 'Lead me in';
    renderWithRouter(<MultipleSubscriptionsPicker {...defaultProps} leadText={leadText} />);
    expect(screen.getByText(leadText)).toBeInTheDocument();
  });
  it('displays a subscription card for each subscription', () => {
    renderWithRouter(<MultipleSubscriptionsPicker {...defaultProps} />);
    defaultProps.subscriptions.forEach((subscription) => {
      expect(screen.getByText(subscription.title)).toBeInTheDocument();
    });
  });
});

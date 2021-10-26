import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { renderWithRouter } from '../../test/testUtils';
import { DEFAULT_LEAD_TEXT } from '../data/constants';

import MultipleSubscriptionsPicker from '../MultipleSubscriptionPicker';

const firstCatalogUuid = 'catalogID1';
const firstEnterpriseUuid = 'ided';
const defaultProps = {
  enterpriseSlug: 'sluggy',
  subscriptions: [
    {
      uuid: firstEnterpriseUuid,
      title: 'Enterprise A',
      startDate: '2021-04-13',
      expirationDate: '2024-04-13',
      enterpriseCatalogUuid: firstCatalogUuid,
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
      enterpriseCatalogUuid: 'catalogID2',
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
    expect(screen.getByText('Plans')).toBeInTheDocument();
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

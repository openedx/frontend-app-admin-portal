import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { SubscriptionContext } from '../../subscriptions/SubscriptionData';
import NoAvailableLicensesBanner from '../NoAvailableLicensesBanner';

// eslint-disable-next-line react/prop-types
const NoAvailalbeLicensesBannerWithContext = ({ subscriptions }) => (
  <SubscriptionContext.Provider value={{
    data: {
      results: subscriptions,
    },
  }}
  >
    <NoAvailableLicensesBanner />
  </SubscriptionContext.Provider>
);

describe('<NoAvailableLicensesBanner />', () => {
  it('should render null if there are no subscriptions', () => {
    const { container } = render(<NoAvailalbeLicensesBannerWithContext subscriptions={[]} />);
    expect(container.childElementCount).toEqual(0);
  });

  it('should render alert if all subscriptions have expired', () => {
    const { getByText } = render(<NoAvailalbeLicensesBannerWithContext subscriptions={[
      {
        agreementNetDaysUntilExpiration: 0,
      },
    ]}
    />);
    expect(getByText('All subscriptions ended'));
  });

  it('should render alert if all licenses have been assigned', () => {
    const { getByText } = render(<NoAvailalbeLicensesBannerWithContext subscriptions={[
      {
        agreementNetDaysUntilExpiration: 1,
        licenses: {
          unassigned: 0,
        },
      },
    ]}
    />);
    expect(getByText('Not enough licenses'));
  });

  it('should render null if there are available licenses', () => {
    const { container } = render(<NoAvailalbeLicensesBannerWithContext subscriptions={[
      {
        agreementNetDaysUntilExpiration: 1,
        licenses: {
          unassigned: 1,
        },
      },
    ]}
    />);
    expect(container.childElementCount).toEqual(0);
  });

  it('should dimiss banner', async () => {
    const { getByText, container } = render(<NoAvailalbeLicensesBannerWithContext subscriptions={[
      {
        agreementNetDaysUntilExpiration: 0,
      },
    ]}
    />);
    const dismissBtn = getByText('Dismiss');
    fireEvent.click(dismissBtn);
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});

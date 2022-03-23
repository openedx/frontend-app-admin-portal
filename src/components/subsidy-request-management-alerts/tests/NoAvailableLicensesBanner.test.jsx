import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import NoAvailableLicensesBanner from '../NoAvailableLicensesBanner';

describe('<NoAvailableLicensesBanner />', () => {
  it('should render null if there are no subscriptions', () => {
    const { container } = render(
      <NoAvailableLicensesBanner subscriptions={[]} />,
    );
    expect(container.childElementCount).toEqual(0);
  });

  it('should render alert if all subscriptions have expired', () => {
    const { getByText } = render(
      <NoAvailableLicensesBanner
        subscriptions={[
          {
            daysUntilExpiration: 0,
          },
        ]}
      />,
    );
    expect(getByText('All subscriptions ended'));
  });

  it('should render alert if all licenses in active subscriptions have been assigned', () => {
    const { getByText } = render(
      <NoAvailableLicensesBanner
        subscriptions={[
          {
            daysUntilExpiration: 1,
            licenses: {
              unassigned: 0,
            },
          },
          {
            daysUntilExpiration: 0,
            licenses: {
              unassigned: 3,
            },
          },
        ]}
      />,
    );
    expect(getByText('Not enough licenses'));
  });

  it('should render null if there are available licenses', () => {
    const { container } = render(
      <NoAvailableLicensesBanner
        subscriptions={[
          {
            daysUntilExpiration: 1,
            licenses: {
              unassigned: 1,
            },
          },
        ]}
      />,
    );
    expect(container.childElementCount).toEqual(0);
  });

  it('should dimiss banner', async () => {
    const { getByText, container } = render(
      <NoAvailableLicensesBanner
        subscriptions={[
          {
            daysUntilExpiration: 0,
          },
        ]}
      />,
    );
    const dismissBtn = getByText('Dismiss');
    fireEvent.click(dismissBtn);
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});

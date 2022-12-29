import React from 'react';
import {
  render,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import NoAvailableLicensesBanner from '../NoAvailableLicensesBanner';

const NoAvailableLicensesBannerWrapper = (props) => (
  <IntlProvider locale="en">
    <NoAvailableLicensesBanner {...props} />
  </IntlProvider>
);

describe('<NoAvailableLicensesBanner />', () => {
  it('should render null if there are no subscriptions', () => {
    const { container } = render(
      <NoAvailableLicensesBannerWrapper subscriptions={[]} />,
    );
    expect(container.childElementCount).toEqual(0);
  });

  it('should render alert if all subscriptions have expired', () => {
    const { getByText } = render(
      <NoAvailableLicensesBannerWrapper
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
      <NoAvailableLicensesBannerWrapper
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
      <NoAvailableLicensesBannerWrapper
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
      <NoAvailableLicensesBannerWrapper
        subscriptions={[
          {
            daysUntilExpiration: 0,
          },
        ]}
      />,
    );
    const dismissBtn = getByText('Dismiss');
    userEvent.click(dismissBtn);
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});

import React from 'react';
import {
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { NoAvailableCodesBanner } from '../NoAvailableCodesBanner';

const NoAvailableCodesBannerWrapper = (props) => (
  <IntlProvider locale="en">
    <NoAvailableCodesBanner {...props} />
  </IntlProvider>
);

describe('<NoAvailableCodesBanner />', () => {
  it('should render null if there are no coupons', () => {
    const { container } = render(<NoAvailableCodesBannerWrapper coupons={[]} />);
    expect(container.childElementCount).toEqual(0);
  });

  it('should render alert if all coupons have expired', () => {
    const { getByText } = render(
      <NoAvailableCodesBannerWrapper
        coupons={[
          {
            numUnassigned: 1,
            endDate: dayjs().subtract(1, 'days').toISOString(),
          },
        ]}
      />,
    );

    expect(getByText('All code batches expired'));
  });

  it('should render alert if all active codes have been assigned', () => {
    const { getByText } = render((
      <NoAvailableCodesBannerWrapper
        coupons={[
          {
            numUnassigned: 0,
            endDate: dayjs().add(1, 'days').toISOString(),
          },
          {
            numUnassigned: 1,
            endDate: dayjs().subtract(1, 'days').toISOString(),
          },
        ]}
      />
    ));
    expect(getByText('Not enough codes'));
  });

  it('should render null if there are available codes', () => {
    const { container } = render(
      <NoAvailableCodesBannerWrapper
        coupons={[
          {
            numUnassigned: 0,
            endDate: dayjs().add(1, 'days').toISOString(),
          },
          {
            numUnassigned: 1,
            endDate: dayjs().add(1, 'days').toISOString(),
          },
        ]}
      />,
    );
    expect(container.childElementCount).toEqual(0);
  });

  it('should dismiss banner', async () => {
    const { getByText, container } = render((
      <NoAvailableCodesBannerWrapper
        coupons={[{
          numUnassigned: 1,
          endDate: dayjs().subtract(1, 'days').toISOString(),
        }]}
      />
    ));
    const dismissBtn = getByText('Dismiss');
    userEvent.click(dismissBtn);
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});

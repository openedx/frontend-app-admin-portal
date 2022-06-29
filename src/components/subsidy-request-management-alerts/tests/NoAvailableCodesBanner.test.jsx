import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import moment from 'moment';
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
            endDate: moment().subtract(1, 'days').toISOString(),
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
            endDate: moment().add(1, 'days').toISOString(),
          },
          {
            numUnassigned: 1,
            endDate: moment().subtract(1, 'days').toISOString(),
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
            endDate: moment().add(1, 'days').toISOString(),
          },
          {
            numUnassigned: 1,
            endDate: moment().add(1, 'days').toISOString(),
          },
        ]}
      />,
    );
    expect(container.childElementCount).toEqual(0);
  });

  it('should dimiss banner', async () => {
    const { getByText, container } = render((
      <NoAvailableCodesBannerWrapper
        coupons={[{
          numUnassigned: 1,
          endDate: moment().subtract(1, 'days').toISOString(),
        }]}
      />
    ));
    const dismissBtn = getByText('Dismiss');
    fireEvent.click(dismissBtn);
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});

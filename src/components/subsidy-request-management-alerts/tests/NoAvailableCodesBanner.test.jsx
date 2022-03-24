import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import moment from 'moment';
import { NoAvailableCodesBanner } from '../NoAvailableCodesBanner';

describe('<NoAvailableCodesBanner />', () => {
  it('should render null if there are no coupons', () => {
    const { container } = render(<NoAvailableCodesBanner coupons={[]} />);
    expect(container.childElementCount).toEqual(0);
  });

  it('should render alert if all coupons have expired', () => {
    const { getByText } = render(
      <NoAvailableCodesBanner
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
    const { getByText } = render(<NoAvailableCodesBanner
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
    />);
    expect(getByText('Not enough codes'));
  });

  it('should render null if there are available codes', () => {
    const { container } = render(
      <NoAvailableCodesBanner
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
    const { getByText, container } = render(
      <NoAvailableCodesBanner
        coupons={[{
          numUnassigned: 1,
          endDate: moment().subtract(1, 'days').toISOString(),
        }]}
      />,
    );
    const dismissBtn = getByText('Dismiss');
    fireEvent.click(dismissBtn);
    await waitFor(() => {
      expect(container.childElementCount).toEqual(0);
    });
  });
});

import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import moment from 'moment';
import { Context as ResponsiveContext } from 'react-responsive';
import {
  breakpoints,
} from '@edx/paragon';
import { renderWithRouter } from '../../test/testUtils';
import SubscriptionCard from '../SubscriptionCard';

const defaultSubscription = {
  uuid: 'ided',
  title: 'Select something',
  startDate: '2021-04-13',
  expirationDate: '2024-04-13',
};
const defaultProps = {
  subscription: defaultSubscription,
  licenses: {
    assigned: 5,
    unassigned: 2,
    activated: 3,
    allocated: 10,
    total: 20,
  },
};

jest.mock('moment', () => (date) => {
  if (date) {
    return jest.requireActual('moment')(date);
  }
  return jest.requireActual('moment')('2020-01-01T00:00:00.000Z');
});

describe('SubscriptionCard', () => {
  it('displays subscription information', () => {
    renderWithRouter(<SubscriptionCard {...defaultProps} />);
    const { title } = defaultSubscription;
    expect(screen.getByText(title));
  });

  it.each([
    [moment().add(1, 'days').toISOString(), '1 day'],
    [moment().add(3, 'days').toISOString(), '3 days'],
    [moment().add(1, 'hours').toISOString(), '1 hour'],
    [moment().add(3, 'hours').toISOString(), '3 hours'],
  ])('displays days until plan starts text if there are no actions and the plan is scheduled', (startDate, expectedText) => {
    renderWithRouter(
      <ResponsiveContext.Provider value={{ width: breakpoints.extraSmall.maxWidth }}>
        <SubscriptionCard
          {...defaultProps}
          subscription={{
            ...defaultSubscription,
            startDate,
          }}
        />
      </ResponsiveContext.Provider>,
    );

    expect(screen.getByText(`Plan begins in ${expectedText}`));
  });

  it('displays actions', () => {
    const mockCreateActions = jest.fn(() => ([{
      variant: 'primary',
      to: '/',
      buttonText: 'action 1',
    }]));
    renderWithRouter(
      <SubscriptionCard
        {...defaultProps}
        createActions={mockCreateActions}
      />,
    );
    expect(mockCreateActions).toHaveBeenCalledWith(defaultSubscription);
    expect(screen.getByText('action 1'));
  });
});

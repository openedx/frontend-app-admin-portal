import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';

import { useAllSubscriptionUsers } from '../../subscriptions/data/hooks';

import { ADD_LEARNERS_TITLE } from './constants';
import BulkEnrollContextProvider from '../BulkEnrollmentContext';
import AddLearnersStep, { TABLE_HEADERS } from './AddLearnersStep';

jest.mock('../../subscriptions/data/hooks', () => ({
  useAllSubscriptionUsers: jest.fn(),
}));

useAllSubscriptionUsers.mockReturnValue({
  results: [],
  count: 0,
});

const defaultProps = {
  isOpen: true,
  close: jest.fn(),
  subscriptionUUID: 'fakest-uuid',
};

const StepperWrapper = (props) => (
  <BulkEnrollContextProvider>
    <AddLearnersStep {...props} />
  </BulkEnrollContextProvider>
);

describe('AddLearnersStep', () => {
  it('displays a title', () => {
    render(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(ADD_LEARNERS_TITLE)).toBeInTheDocument();
  });
  it('displays a table', () => {
    render(<StepperWrapper {...defaultProps} />);
    Object.values(TABLE_HEADERS).forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });
});

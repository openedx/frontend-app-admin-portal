import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { useAllSubscriptionUsers } from '../../subscriptions/data/hooks';

import BulkEnrollmentStepper from './BulkEnrollmentStepper';
import {
  STEPPER_TITLE, ADD_LEARNERS_TITLE, REVIEW_TITLE, PREV_BUTTON_TEST_ID, NEXT_BUTTON_TEST_ID, FINAL_BUTTON_TEXT,
} from './constants';
import BulkEnrollContextProvider from '../BulkEnrollmentContext';

jest.mock('../../subscriptions/data/hooks', () => ({
  useAllSubscriptionUsers: jest.fn(),
}));

useAllSubscriptionUsers.mockReturnValue([{
  results: [],
  count: 0,
}, false]);

const defaultProps = {
  isOpen: true,
  close: jest.fn(),
  subscriptionUUID: 'fakest-uuid',
};

const StepperWrapper = (props) => (
  <BulkEnrollContextProvider>
    <BulkEnrollmentStepper {...props} />
  </BulkEnrollContextProvider>
);

describe('BulkEnrollmentStepper', () => {
  it('displays a title', () => {
    render(<StepperWrapper {...defaultProps} />);
    expect(screen.getByText(STEPPER_TITLE)).toBeInTheDocument();
  });
  it('starts on the add learners step', () => {
    render(<StepperWrapper {...defaultProps} />);
    expect(screen.getAllByText(ADD_LEARNERS_TITLE)).toHaveLength(2);
    expect(screen.getByTestId(NEXT_BUTTON_TEST_ID)).toBeInTheDocument();
    expect(screen.queryByTestId(FINAL_BUTTON_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByTestId(PREV_BUTTON_TEST_ID)).not.toBeInTheDocument();
  });
  it('takes users to the review step when they click next', () => {
    render(<StepperWrapper {...defaultProps} />);
    const nextButton = screen.getByTestId(NEXT_BUTTON_TEST_ID);
    userEvent.click(nextButton);
    expect(screen.getAllByText(REVIEW_TITLE)).toHaveLength(1);
    expect(screen.getByText(FINAL_BUTTON_TEXT)).toBeInTheDocument();
  });
  it('returns users to the add learners step when they click previous', () => {
    render(<StepperWrapper {...defaultProps} />);
    const nextButton = screen.getByTestId(NEXT_BUTTON_TEST_ID);
    userEvent.click(nextButton);
    const prevButton = screen.getByTestId(PREV_BUTTON_TEST_ID);
    userEvent.click(prevButton);
    expect(screen.getAllByText(ADD_LEARNERS_TITLE)).toHaveLength(2);
  });
});

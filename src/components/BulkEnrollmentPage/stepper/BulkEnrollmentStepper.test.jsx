import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import userEvent from '@testing-library/user-event';

import { useAllSubscriptionUsers } from '../../subscriptions/data/hooks';

import BulkEnrollmentStepper from './BulkEnrollmentStepper';
import {
  ADD_LEARNERS_TITLE, REVIEW_TITLE, PREV_BUTTON_TEST_ID, NEXT_BUTTON_TEST_ID, FINAL_BUTTON_TEXT,
  ADD_COURSES_TITLE,
} from './constants';
import BulkEnrollContextProvider from '../BulkEnrollmentContext';

import '../../../../__mocks__/react-instantsearch-dom';
import { renderWithRouter } from '../../test/testUtils';

jest.mock('../../subscriptions/data/hooks', () => ({
  useAllSubscriptionUsers: jest.fn(),
}));

const mockEmailResponse = {
  results: [{ uuid: 'foo', userEmail: 'y@z.com' }, { uuid: 'bar', userEmail: 'a@z.com' }],
  count: 2,
};

useAllSubscriptionUsers.mockReturnValue([mockEmailResponse, false]);

const defaultProps = {
  enterpriseId: 'fakeID',
  enterpriseSlug: 'fakr',
  subscription: { uuid: 'fakest-uuid', enterpriseName: 'fakeCo', enterpriseCatalogUuid: '12345' },
};

const StepperWrapper = (props) => (
  <BulkEnrollContextProvider>
    <BulkEnrollmentStepper {...props} />
  </BulkEnrollContextProvider>
);

const navigateToAddLearners = () => {
  const selectAll = screen.getByTestId('selectAll');
  userEvent.click(selectAll);
  userEvent.click(screen.getByTestId(NEXT_BUTTON_TEST_ID));
};

const navigateToReview = () => {
  navigateToAddLearners();
  const selectAll = screen.getByTestId('selectAll');
  userEvent.click(selectAll);
  const nextButton = screen.getByTestId(NEXT_BUTTON_TEST_ID);
  userEvent.click(nextButton);
};

describe('BulkEnrollmentStepper', () => {
  it('starts on the add courses step', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getAllByText(ADD_COURSES_TITLE)).toHaveLength(2);
  });
  it('displays the step names on the add courses step', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getAllByText(ADD_COURSES_TITLE)).toHaveLength(2);
    expect(screen.getAllByText(ADD_LEARNERS_TITLE)).toHaveLength(1);
    expect(screen.getAllByText(REVIEW_TITLE)).toHaveLength(1);
  });
  it('disables the next button if no courses are selected', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByTestId(NEXT_BUTTON_TEST_ID)).toHaveAttribute('disabled');
  });
  it('selects all courses when clicking on the select column header', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);

    const selectAll = screen.getByTestId('selectAll');
    userEvent.click(selectAll);
    const checkboxes = screen.getAllByTestId('selectOne');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveProperty('checked', true);
    });
  });
  it('clicking next brings you to the Add learners step', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);

    navigateToAddLearners();

    expect(screen.getAllByText(ADD_LEARNERS_TITLE)).toHaveLength(2);
    expect(screen.getByTestId(NEXT_BUTTON_TEST_ID)).toBeInTheDocument();
    expect(screen.queryByTestId(FINAL_BUTTON_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByTestId(PREV_BUTTON_TEST_ID)).toBeInTheDocument();
  });
  it('clicking previous from Add learners brings you back to Add courses', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    navigateToAddLearners();
    const prevButton = screen.getByTestId(PREV_BUTTON_TEST_ID);
    userEvent.click(prevButton);
    expect(screen.getAllByText(ADD_COURSES_TITLE)).toHaveLength(2);
  });
  it('displays the user emails', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    navigateToAddLearners();
    mockEmailResponse.results.forEach((result) => expect(screen.getByText(result.userEmail)).toBeInTheDocument());
  });
  it('takes users to the review step when they click next', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    navigateToReview();
    expect(screen.getAllByText(REVIEW_TITLE)).toHaveLength(2);
    expect(screen.getByText(FINAL_BUTTON_TEXT)).toBeInTheDocument();
  });
  it('returns users to the add learners step when they click previous', () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    navigateToReview();
    const prevButton = screen.getByTestId(PREV_BUTTON_TEST_ID);
    userEvent.click(prevButton);
    expect(screen.getAllByText(ADD_LEARNERS_TITLE)).toHaveLength(2);
  });
});

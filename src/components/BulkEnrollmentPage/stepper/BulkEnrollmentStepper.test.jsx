import { act, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import userEvent from '@testing-library/user-event';

import LicenseManagerApiService from '../../../data/services/LicenseManagerAPIService';

import BulkEnrollmentStepper from './BulkEnrollmentStepper';
import {
  ADD_LEARNERS_TITLE, REVIEW_TITLE, PREV_BUTTON_TEST_ID, NEXT_BUTTON_TEST_ID, FINAL_BUTTON_TEXT,
  ADD_COURSES_TITLE, WARNING_ALERT_TITLE_TEXT,
} from './constants';
import BulkEnrollContextProvider from '../BulkEnrollmentContext';

import '../../../../__mocks__/react-instantsearch-dom';
import { renderWithRouter } from '../../test/testUtils';
import { ToastsContext } from '../../Toasts/ToastsProvider';

jest.mock('../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchSubscriptionUsers: jest.fn(),
  },
}));

const mockLearnerData = [{ uuid: 'foo', userEmail: 'y@z.com' }, { uuid: 'bar', userEmail: 'a@z.com' }];

const mockEmailResponse = Promise.resolve({
  data: {
    results: mockLearnerData,
    count: 2,
    numPages: 6,
  },
});

LicenseManagerApiService.fetchSubscriptionUsers.mockReturnValue(mockEmailResponse);
const flushPromises = () => new Promise(setImmediate);
const defaultProps = {
  enterpriseId: 'fakeID',
  enterpriseSlug: 'fakr',
  subscription: { uuid: 'fakest-uuid', enterpriseName: 'fakeCo', enterpriseCatalogUuid: '12345' },
};

const addToast = jest.fn();

const StepperWrapper = (props) => (
  <ToastsContext.Provider value={{ addToast }}>
    <BulkEnrollContextProvider>
      <BulkEnrollmentStepper {...props} />
    </BulkEnrollContextProvider>
  </ToastsContext.Provider>
);

const navigateToAddLearners = () => {
  const selectAll = screen.getByTestId('selectAll');
  userEvent.click(selectAll);
  userEvent.click(screen.getByTestId(NEXT_BUTTON_TEST_ID));
  flushPromises();
};

const navigateToReview = async () => {
  navigateToAddLearners();
  const selectAll = await screen.findByTestId('selectAll');
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
  it('disables the next button if no courses are selected', async () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    expect(screen.getByTestId(NEXT_BUTTON_TEST_ID)).toHaveAttribute('disabled');
    await act(() => mockEmailResponse);
  });
  it('selects all courses when clicking on the select column header', async () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);

    const selectAll = screen.getByTestId('selectAll');
    userEvent.click(selectAll);
    expect(screen.queryByText(WARNING_ALERT_TITLE_TEXT)).not.toBeInTheDocument();
    const checkboxes = screen.getAllByTestId('selectOne');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toHaveProperty('checked', true);
    });
    await act(() => mockEmailResponse);
  });
  it('clicking next brings you to the Add learners step', async () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);

    navigateToAddLearners();

    expect(screen.getAllByText(ADD_LEARNERS_TITLE)).toHaveLength(2);
    expect(screen.getByTestId(NEXT_BUTTON_TEST_ID)).toBeInTheDocument();
    expect(screen.queryByTestId(FINAL_BUTTON_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByTestId(PREV_BUTTON_TEST_ID)).toBeInTheDocument();
    await act(() => mockEmailResponse);
  });
  it('clicking previous from Add learners brings you back to Add courses and retains selection', async () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    navigateToAddLearners();
    const prevButton = screen.getByTestId(PREV_BUTTON_TEST_ID);
    userEvent.click(prevButton);
    expect(screen.getAllByText(ADD_COURSES_TITLE)).toHaveLength(2);
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    await act(() => mockEmailResponse);
  });
  it('displays the user emails', async () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    navigateToAddLearners();
    expect(await screen.findByText(mockLearnerData[0].userEmail)).toBeInTheDocument();
    expect(await screen.findByText(mockLearnerData[1].userEmail)).toBeInTheDocument();
    await act(() => mockEmailResponse);
  });
  it('takes users to the review step when they click next', async () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    await navigateToReview();
    expect(screen.getAllByText(REVIEW_TITLE)).toHaveLength(2);
    expect(screen.getByText(FINAL_BUTTON_TEXT)).toBeInTheDocument();
  });
  it('returns users to the add learners step when they click previous', async () => {
    renderWithRouter(<StepperWrapper {...defaultProps} />);
    await navigateToReview();
    const prevButton = screen.getByTestId(PREV_BUTTON_TEST_ID);

    userEvent.click(prevButton);

    expect(screen.getAllByText(ADD_LEARNERS_TITLE)).toHaveLength(2);
    await act(() => mockEmailResponse);
  });
});

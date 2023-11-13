import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import CourseCard from './CourseCard';
import {
  formatPrice,
  learnerCreditManagementQueryKeys,
  useBudgetId,
  useSubsidyAccessPolicy,
} from '../data';
import { getButtonElement, queryClient } from '../../test/testUtils';

import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  useBudgetId: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
}));
jest.mock('../../../data/services/EnterpriseAccessApiService');

const originalData = {
  availability: ['Upcoming'],
  card_image_url: undefined,
  course_type: 'course',
  key: 'course-123x',
  normalized_metadata: {
    enroll_by_date: '2016-02-18T04:00:00Z',
    start_date: '2016-04-18T04:00:00Z',
    content_price: 100,
  },
  original_image_url: '',
  partners: [{ logo_image_url: '', name: 'Course Provider' }],
  title: 'Course Title',
};
const imageAltText = `${originalData.title} course image`;

const defaultProps = {
  original: originalData,
};

const mockLearnerPortal = 'https://enterprise.stage.edx.org';

const execEdData = {
  availability: ['Upcoming'],
  card_image_url: undefined,
  course_type: 'executive-education-2u',
  key: 'exec-ed-course-123x',
  entitlements: [{ price: '999.00' }],
  normalized_metadata: {
    enroll_by_date: '2016-02-18T04:00:00Z',
    start_date: '2016-04-18T04:00:00Z',
    content_price: 999,
  },
  original_image_url: '',
  partners: [{ logo_image_url: '', name: 'Course Provider' }],
  title: 'Exec Ed Title',
};
const execEdProps = {
  original: execEdData,
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const enterpriseSlug = 'test-enterprise-slug';
const enterpriseUUID = '1234';
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: enterpriseUUID,
    enterpriseSlug,
  },
};

const mockSubsidyAccessPolicy = {
  uuid: 'test-subsidy-access-policy-uuid',
  displayName: 'Test Subsidy Access Policy',
  aggregates: {
    spendAvailableUsd: 50000,
  },
};
const mockLearnerEmails = ['hello@example.com', 'world@example.com'];

const mockDisplaySuccessfulAssignmentToast = jest.fn();
const defaultBudgetDetailPageContextValue = {
  isSuccessfulAssignmentAllocationToastOpen: false,
  totalLearnersAssigned: undefined,
  displayToastForAssignmentAllocation: mockDisplaySuccessfulAssignmentToast,
  closeToastForAssignmentAllocation: jest.fn(),
};

const CourseCardWrapper = ({
  initialState = initialStoreState,
  budgetDetailPageContextValue = defaultBudgetDetailPageContextValue,
  ...rest
}) => {
  const store = getMockStore({ ...initialState });

  return (
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <Provider store={store}>
          <AppContext.Provider
            value={{
              config: { ENTERPRISE_LEARNER_PORTAL_URL: mockLearnerPortal },
            }}
          >
            <BudgetDetailPageContext.Provider value={budgetDetailPageContextValue}>
              <CourseCard {...rest} />
            </BudgetDetailPageContext.Provider>
          </AppContext.Provider>
        </Provider>
      </IntlProvider>
    </QueryClientProvider>
  );
};

describe('Course card works as expected', () => {
  const mockAllocateContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'allocateContentAssignments');

  // Helper function to find the assignment error modal after failed allocation attempt
  const getAssignmentErrorModal = () => within(screen.queryAllByRole('dialog')[1]);

  // Helper function to simulate clicking on "Try again" in error modal to retry allocation
  const simulateClickErrorModalTryAgain = async (modalTitle, assignmentErrorModal) => {
    const tryAgainCTA = getButtonElement('Try again', { screenOverride: assignmentErrorModal });
    expect(tryAgainCTA).toBeInTheDocument();
    userEvent.click(tryAgainCTA);
    await waitFor(() => {
      // Verify modal closes
      expect(assignmentErrorModal.queryByText(modalTitle)).not.toBeInTheDocument();
    });
    expect(mockAllocateContentAssignments).toHaveBeenCalledTimes(2);
  };

  // Helper function to simulate clicking on "Exit and discard changes" in error modal to close ALL modals
  const simulateClickErrorModalExit = async (assignmentErrorModal) => {
    const exitCTA = getButtonElement('Exit and discard changes', { screenOverride: assignmentErrorModal });
    userEvent.click(exitCTA);
    await waitFor(() => {
      // Verify all modals close (error modal + assignment modal)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(mockAllocateContentAssignments).toHaveBeenCalledTimes(1);
  };

  beforeEach(() => {
    useSubsidyAccessPolicy.mockReturnValue({
      data: mockSubsidyAccessPolicy,
      isLoading: false,
    });
    useBudgetId.mockReturnValue({ subsidyAccessPolicyId: mockSubsidyAccessPolicy.uuid });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('course card renders', () => {
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);
    expect(screen.getByText(defaultProps.original.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.original.partners[0].name)).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('Per learner price')).toBeInTheDocument();
    expect(screen.getByText('Upcoming • Learner must enroll by Feb 18, 2016')).toBeInTheDocument();
    expect(screen.getByText('Course')).toBeInTheDocument();
    // Has card image defined even though the course metadata does not contain an image URL
    const cardImage = screen.getByAltText(imageAltText);
    expect(cardImage).toBeInTheDocument();
    expect(cardImage.src).toBeDefined();

    // Footer actions
    const viewCourseCTA = screen.getByText('View course', { selector: 'a' });
    expect(viewCourseCTA).toBeInTheDocument();
    expect(viewCourseCTA.href).toContain('https://enterprise.stage.edx.org/test-enterprise-slug/course/course-123x');
    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
  });

  test('card renders given image', () => {
    const mockCardImageUrl = 'https://example.com/image.jpg';
    const props = {
      ...defaultProps,
      original: {
        ...originalData,
        card_image_url: mockCardImageUrl,
      },
    };
    renderWithRouter(<CourseCardWrapper {...props} />);
    const cardImage = screen.getByAltText(imageAltText);
    expect(cardImage).toBeInTheDocument();
    expect(cardImage.src).toEqual(mockCardImageUrl);
  });

  test('executive education card renders', () => {
    renderWithRouter(<CourseCardWrapper {...execEdProps} />);
    expect(screen.queryByText('$999')).toBeInTheDocument();
    expect(screen.queryByText('Starts Apr 18, 2016 • Learner must enroll by Feb 18, 2016')).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).toBeInTheDocument();
    const viewCourseCTA = screen.getByText('View course', { selector: 'a' });
    expect(viewCourseCTA.href).toContain('https://enterprise.stage.edx.org/test-enterprise-slug/executive-education-2u/course/exec-ed-course-123x');
  });

  test.each([
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      errorReason: 'content_not_in_catalog',
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      errorReason: 'not_enough_value_in_subsidy',
      shouldRetryAfterError: false,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      errorReason: 'not_enough_value_in_subsidy',
      shouldRetryAfterError: true,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      errorReason: 'policy_spend_limit_reached',
      shouldRetryAfterError: false,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      errorReason: 'policy_spend_limit_reached',
      shouldRetryAfterError: true,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      errorReason: null,
      shouldRetryAfterError: false,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      errorReason: null,
      shouldRetryAfterError: true,
    },
    { shouldSubmitAssignments: true, hasAllocationException: false },
    { shouldSubmitAssignments: false, hasAllocationException: false },
  ])('opens assignment modal, submits assignments successfully (%s)', async ({
    shouldSubmitAssignments,
    hasAllocationException,
    errorReason,
    shouldRetryAfterError,
  }) => {
    if (hasAllocationException) {
      // mock Axios error
      mockAllocateContentAssignments.mockRejectedValue({
        customAttributes: {
          httpErrorStatus: errorReason ? 422 : 500,
          httpErrorResponseData: JSON.stringify([{ reason: errorReason }]),
        },
      });
    } else {
      mockAllocateContentAssignments.mockResolvedValue({
        data: {
          updated: [],
          created: mockLearnerEmails.map(learnerEmail => ({
            uuid: '095be615-a8ad-4c33-8e9c-c7612fbf6c9f',
            assignment_configuration: 'fd456a98-653b-41e9-94d1-94d7b136832a',
            learner_email: learnerEmail,
            lms_user_id: 0,
            content_key: 'string',
            content_title: 'string',
            content_quantity: 0,
            state: 'allocated',
            transaction_uuid: '3a6bcbed-b7dc-4791-84fe-b20f12be4001',
            last_notification_at: '2019-08-24T14:15:22Z',
            actions: [],
          })),
          no_change: [],
        },
      });
    }
    useBudgetId.mockReturnValue({ subsidyAccessPolicyId: mockSubsidyAccessPolicy.uuid });
    const mockInvalidateQueries = jest.fn();
    useQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);
    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
    userEvent.click(assignCourseCTA);

    const assignmentModal = within(screen.getByRole('dialog'));

    expect(assignmentModal.getByText('Assign this course')).toBeInTheDocument();
    expect(assignmentModal.getByText('Use Learner Credit to assign this course')).toBeInTheDocument();

    // Verify course card is displayed WITHOUT footer actions
    const modalCourseCard = within(assignmentModal.getByText('Course Title').closest('.pgn__card'));
    expect(modalCourseCard.getByText(defaultProps.original.title)).toBeInTheDocument();
    expect(modalCourseCard.getByText(defaultProps.original.partners[0].name)).toBeInTheDocument();
    expect(modalCourseCard.getByText('$100')).toBeInTheDocument();
    expect(modalCourseCard.getByText('Per learner price')).toBeInTheDocument();
    expect(modalCourseCard.getByText('Upcoming • Learner must enroll by Feb 18, 2016')).toBeInTheDocument();
    expect(modalCourseCard.getByText('Course')).toBeInTheDocument();
    const cardImage = modalCourseCard.getByAltText(imageAltText);
    expect(cardImage).toBeInTheDocument();
    expect(cardImage.src).toBeDefined();
    expect(modalCourseCard.queryByText('View course', { selector: 'a' })).not.toBeInTheDocument();
    expect(getButtonElement('Assign', { screenOverride: modalCourseCard, isQueryByRole: true })).not.toBeInTheDocument();

    // Verify empty state
    expect(assignmentModal.getByText('Assign to')).toBeInTheDocument();
    const textareaInputLabel = assignmentModal.getByLabelText('Learner email addresses');
    expect(textareaInputLabel).toBeInTheDocument();
    const textareaInput = textareaInputLabel.closest('textarea');
    expect(textareaInput).toBeInTheDocument();
    expect(assignmentModal.getByText('To add more than one learner, enter one email address per line.')).toBeInTheDocument();
    expect(assignmentModal.getByText('Pay by Learner Credit')).toBeInTheDocument();
    expect(assignmentModal.getByText('Summary')).toBeInTheDocument();
    expect(assignmentModal.getByText('You haven\'t entered any learners yet.')).toBeInTheDocument();
    expect(assignmentModal.getByText('Add learner emails to get started.')).toBeInTheDocument();
    expect(assignmentModal.getByText(`Learner Credit Budget: ${mockSubsidyAccessPolicy.displayName}`)).toBeInTheDocument();
    expect(assignmentModal.getByText('Available balance')).toBeInTheDocument();
    const expectedAvailableBalance = formatPrice(mockSubsidyAccessPolicy.aggregates.spendAvailableUsd);
    expect(assignmentModal.getByText(expectedAvailableBalance)).toBeInTheDocument();

    // Verify collapsibles
    expect(assignmentModal.getByText('How assigning this course works')).toBeInTheDocument();
    expect(assignmentModal.getByText('Next steps for assigned learners')).toBeInTheDocument();
    expect(assignmentModal.getByText('Learners will be notified of this course assignment by email.')).toBeInTheDocument();
    const budgetImpact = assignmentModal.getByText('Impact on your Learner Credit budget');
    expect(budgetImpact).toBeInTheDocument();
    expect(assignmentModal.queryByText('The total assignment cost will be earmarked as "assigned" funds', { exact: false })).not.toBeInTheDocument();
    userEvent.click(budgetImpact);
    expect(assignmentModal.getByText('The total assignment cost will be earmarked as "assigned" funds', { exact: false })).toBeInTheDocument();
    const managingAssignment = assignmentModal.getByText('Managing this assignment');
    expect(managingAssignment).toBeInTheDocument();
    expect(assignmentModal.queryByText('You will be able to monitor the status of this assignment', { exact: false })).not.toBeInTheDocument();
    userEvent.click(managingAssignment);
    expect(assignmentModal.getByText('You will be able to monitor the status of this assignment', { exact: false })).toBeInTheDocument();

    // Verify modal footer
    expect(assignmentModal.getByText('Help Center: Course Assignments')).toBeInTheDocument();
    const cancelAssignmentCTA = getButtonElement('Cancel', { screenOverride: assignmentModal });
    expect(cancelAssignmentCTA).toBeInTheDocument();
    const submitAssignmentCTA = getButtonElement('Assign', { screenOverride: assignmentModal });
    expect(submitAssignmentCTA).toBeInTheDocument();

    if (shouldSubmitAssignments) {
      // Verify textarea receives input
      userEvent.type(textareaInput, mockLearnerEmails.join('{enter}'));
      expect(textareaInput).toHaveValue(mockLearnerEmails.join('\n'));

      // Verify assignment summary UI updates
      await waitFor(() => {
        expect(assignmentModal.getByText(`Summary (${mockLearnerEmails.length})`)).toBeInTheDocument();
      });
      expect(assignmentModal.queryByText('You haven\'t entered any learners yet.')).not.toBeInTheDocument();
      expect(assignmentModal.queryByText('Add learner emails to get started.')).not.toBeInTheDocument();
      mockLearnerEmails.forEach((learnerEmail) => {
        expect(assignmentModal.getByText(learnerEmail)).toBeInTheDocument();
      });
      expect(assignmentModal.getByText('Total assignment cost')).toBeInTheDocument();
      const expectedAssignmentCost = mockLearnerEmails.length * defaultProps.original.normalized_metadata.content_price;
      expect(assignmentModal.getByText(formatPrice(expectedAssignmentCost))).toBeInTheDocument();
      expect(assignmentModal.getByText('Remaining after assignment')).toBeInTheDocument();
      const expectedBalanceAfterAssignment = (
        mockSubsidyAccessPolicy.aggregates.spendAvailableUsd - expectedAssignmentCost
      );
      expect(assignmentModal.getByText(formatPrice(expectedBalanceAfterAssignment))).toBeInTheDocument();

      // Verify assignment is submitted successfully
      userEvent.click(submitAssignmentCTA);
      await waitFor(() => expect(mockAllocateContentAssignments).toHaveBeenCalledTimes(1));
      expect(mockAllocateContentAssignments).toHaveBeenCalledWith(
        mockSubsidyAccessPolicy.uuid,
        expect.objectContaining({
          content_price_cents: 10000,
          content_key: 'course-123x',
          learner_emails: mockLearnerEmails,
        }),
      );

      // Verify error states
      if (hasAllocationException) {
        expect(getButtonElement('Try again', { screenOverride: assignmentModal })).toHaveAttribute('aria-disabled', 'false');

        // Assert the correct error modal is displayed
        if (errorReason === 'content_not_in_catalog') {
          const assignmentErrorModal = getAssignmentErrorModal();
          expect(assignmentErrorModal.getByText(`This course is not in your ${mockSubsidyAccessPolicy.displayName} budget's catalog`)).toBeInTheDocument();
          const exitCTA = getButtonElement('Exit', { screenOverride: assignmentErrorModal });
          userEvent.click(exitCTA);
          await waitFor(() => {
            // Verify all modals close (error modal + assignment modal)
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
          });
        } else if (['not_enough_value_in_subsidy', 'policy_spend_limit_reached'].includes(errorReason)) {
          const assignmentErrorModal = getAssignmentErrorModal();
          const errorModalTitle = 'Not enough balance';
          expect(assignmentErrorModal.getByText(errorModalTitle)).toBeInTheDocument();
          if (shouldRetryAfterError) {
            await simulateClickErrorModalTryAgain(errorModalTitle, assignmentErrorModal);
          } else {
            await simulateClickErrorModalExit(assignmentErrorModal);
          }
        } else {
          const assignmentErrorModal = getAssignmentErrorModal();
          const errorModalTitle = 'Something went wrong';
          expect(assignmentErrorModal.getByText(errorModalTitle)).toBeInTheDocument();
          if (shouldRetryAfterError) {
            await simulateClickErrorModalTryAgain(errorModalTitle, assignmentErrorModal);
          } else {
            await simulateClickErrorModalExit(assignmentErrorModal);
          }
        }
      } else {
        // Verify success state
        expect(mockInvalidateQueries).toHaveBeenCalledTimes(1);
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: learnerCreditManagementQueryKeys.budget(mockSubsidyAccessPolicy.uuid),
        });
        expect(getButtonElement('Assigned', { screenOverride: assignmentModal })).toHaveAttribute('aria-disabled', 'true');
        await waitFor(() => {
          // Verify all modals close (error modal + assignment modal)
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

          // Verify toast notification was displayed
          expect(mockDisplaySuccessfulAssignmentToast).toHaveBeenCalledTimes(1);
          expect(mockDisplaySuccessfulAssignmentToast).toHaveBeenCalledWith({
            totalLearnersAssigned: mockLearnerEmails.length,
          });
        });
      }
    } else {
      // Otherwise, verify modal closes when cancel button is clicked
      userEvent.click(cancelAssignmentCTA);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  });
});

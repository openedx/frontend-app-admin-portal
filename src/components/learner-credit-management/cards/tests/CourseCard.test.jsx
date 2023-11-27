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
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import CourseCard from '../CourseCard';
import {
  formatPrice,
  learnerCreditManagementQueryKeys,
  useBudgetId,
  useSubsidyAccessPolicy,
} from '../../data';
import { getButtonElement, queryClient } from '../../../test/testUtils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY } from '../data';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useBudgetId: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
}));
jest.mock('../../../../data/services/EnterpriseAccessApiService');

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
    useBudgetId.mockReturnValue({ subsidyAccessPolicyId: mockSubsidyAccessPolicy.uuid });
    useSubsidyAccessPolicy.mockReturnValue({
      data: mockSubsidyAccessPolicy,
      isLoading: false,
    });
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

  test('view course sends segment events', () => {
    renderWithRouter(<CourseCardWrapper {...execEdProps} />);
    const viewCourseCTA = screen.getByText('View course', { selector: 'a' });
    userEvent.click(viewCourseCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });

  test('card exits and sends segment events', () => {
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);

    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
    userEvent.click(assignCourseCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    const assignmentModal = within(screen.getByRole('dialog'));
    expect(assignmentModal.getByText('Assign this course')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    userEvent.click(closeButton);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  test('help center article link sends segment events', () => {
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);

    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
    userEvent.click(assignCourseCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    const helpCenterButton = screen.getByText('Help Center: Course Assignments');

    expect(helpCenterButton).toBeInTheDocument();
    userEvent.click(helpCenterButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  test.each([
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      allocationExceptionReason: 'content_not_in_catalog',
      shouldRetryAllocationAfterException: false, // no ability to retry after this error
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      allocationExceptionReason: 'not_enough_value_in_subsidy',
      shouldRetryAllocationAfterException: false,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      allocationExceptionReason: 'not_enough_value_in_subsidy',
      shouldRetryAllocationAfterException: true,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      allocationExceptionReason: 'policy_spend_limit_reached',
      shouldRetryAllocationAfterException: false,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      allocationExceptionReason: 'policy_spend_limit_reached',
      shouldRetryAllocationAfterException: true,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      allocationExceptionReason: null,
      shouldRetryAllocationAfterException: false,
    },
    {
      shouldSubmitAssignments: true,
      hasAllocationException: true,
      allocationExceptionReason: null,
      shouldRetryAllocationAfterException: true,
    },
    { shouldSubmitAssignments: true, hasAllocationException: false },
    { shouldSubmitAssignments: false, hasAllocationException: false },
  ])('opens assignment modal, fills out information, and submits assignments accordingly - with success or with an exception (%s)', async ({
    shouldSubmitAssignments,
    hasAllocationException,
    allocationExceptionReason,
    shouldRetryAllocationAfterException,
  }) => {
    if (hasAllocationException) {
      // mock Axios error
      mockAllocateContentAssignments.mockRejectedValue({
        customAttributes: {
          httpErrorStatus: allocationExceptionReason ? 422 : 500,
          httpErrorResponseData: JSON.stringify([{ reason: allocationExceptionReason }]),
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
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
    expect(assignmentModal.queryByText('The total assignment cost will be earmarked as "assigned" funds', { exact: false })).not.toBeInTheDocument();
    userEvent.click(budgetImpact);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    expect(assignmentModal.getByText('The total assignment cost will be earmarked as "assigned" funds', { exact: false })).toBeInTheDocument();
    const managingAssignment = assignmentModal.getByText('Managing this assignment');
    expect(managingAssignment).toBeInTheDocument();
    expect(assignmentModal.queryByText('You will be able to monitor the status of this assignment', { exact: false })).not.toBeInTheDocument();
    userEvent.click(managingAssignment);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(3);
    expect(assignmentModal.getByText('You will be able to monitor the status of this assignment', { exact: false })).toBeInTheDocument();
    const nextSteps = assignmentModal.getByText('Next steps for assigned learners');
    userEvent.click(nextSteps);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(4);
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
      }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
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
        if (allocationExceptionReason === 'content_not_in_catalog') {
          const assignmentErrorModal = getAssignmentErrorModal();
          expect(assignmentErrorModal.getByText(`This course is not in your ${mockSubsidyAccessPolicy.displayName} budget's catalog`)).toBeInTheDocument();
          const exitCTA = getButtonElement('Exit', { screenOverride: assignmentErrorModal });
          userEvent.click(exitCTA);
          await waitFor(() => {
            // Verify all modals close (error modal + assignment modal)
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
          });
        } else if (['not_enough_value_in_subsidy', 'policy_spend_limit_reached'].includes(allocationExceptionReason)) {
          const assignmentErrorModal = getAssignmentErrorModal();
          const errorModalTitle = 'Not enough balance';
          expect(assignmentErrorModal.getByText(errorModalTitle)).toBeInTheDocument();
          if (shouldRetryAllocationAfterException) {
            await simulateClickErrorModalTryAgain(errorModalTitle, assignmentErrorModal);
          } else {
            await simulateClickErrorModalExit(assignmentErrorModal);
          }
        } else {
          const assignmentErrorModal = getAssignmentErrorModal();
          const errorModalTitle = 'Something went wrong';
          expect(assignmentErrorModal.getByText(errorModalTitle)).toBeInTheDocument();
          if (shouldRetryAllocationAfterException) {
            await simulateClickErrorModalTryAgain(errorModalTitle, assignmentErrorModal);
            expect(sendEnterpriseTrackEvent).toHaveBeenCalled();
          } else {
            await simulateClickErrorModalExit(assignmentErrorModal);
            expect(sendEnterpriseTrackEvent).toHaveBeenCalled();
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

  it.each([
    {
      learnerEmails: ['a@a.com', 'b@bcom', 'c@c.com'],
      spendAvailableUsd: 1000,
      expectedValidationMessage: 'b@bcom is not a valid email.',
    },
    {
      learnerEmails: ['a@a.com', 'b@b.com', 'c@c.com', 'b@b.com'],
      spendAvailableUsd: 1000,
      expectedValidationMessage: 'b@b.com has been entered more than once.',
    },
    {
      learnerEmails: ['a@a.com', 'b@bcom', 'c@c.com', 'a@a.com'],
      spendAvailableUsd: 1000,
      expectedValidationMessage: 'b@bcom is not a valid email.',
    },
    {
      learnerEmails: ['a@a.com', 'b@b.com', 'c@c.com'],
      spendAvailableUsd: 100, // assignment allocation will exceed available spend
      expectedValidationMessage: 'The total assignment cost exceeds your available Learner Credit budget balance of $100. Please remove learners and try again.',
    },
    {
      learnerEmails: ['a@a.com', 'b@b.com', 'c@c.com'],
      spendAvailableUsd: 1000,
      expectedValidationMessage: undefined, // no validation error
    },
  ])('opens assignment modal, fills out information, and handles client-side validation (%s)', async ({
    learnerEmails,
    spendAvailableUsd,
    expectedValidationMessage,
  }) => {
    useSubsidyAccessPolicy.mockReturnValue({
      data: {
        ...mockSubsidyAccessPolicy,
        aggregates: {
          ...mockSubsidyAccessPolicy.aggregates,
          spendAvailableUsd,
        },
      },
      isLoading: false,
    });

    renderWithRouter(<CourseCardWrapper {...defaultProps} />);
    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
    userEvent.click(assignCourseCTA);

    const assignmentModal = within(screen.getByRole('dialog'));

    // Verify "Assign" CTA is disabled
    expect(getButtonElement('Assign', { screenOverride: assignmentModal })).toBeDisabled();

    // Verify textarea receives input
    const textareaInputLabel = assignmentModal.getByLabelText('Learner email addresses');
    expect(textareaInputLabel).toBeInTheDocument();
    const textareaInput = textareaInputLabel.closest('textarea');
    expect(textareaInput).toBeInTheDocument();
    userEvent.type(textareaInput, learnerEmails.join('{enter}'));
    expect(textareaInput).toHaveValue(learnerEmails.join('\n'));

    await waitFor(() => {
      if (expectedValidationMessage) {
        expect(assignmentModal.getByText(expectedValidationMessage)).toBeInTheDocument();

        // Verify assigment modal summary contents handle the input validation errors, based on whether
        // the validation error relates to the email addresses entered or having sufficient available spend.
        const assignmentAllocationCost = learnerEmails.length * originalData.normalized_metadata.content_price;
        if (assignmentAllocationCost <= spendAvailableUsd) {
          const assignmentSummaryCard = assignmentModal.getByText('Learners can\'t be assigned as entered.').closest('.assignment-modal-summary-card');
          expect(assignmentSummaryCard).toBeInTheDocument();
          expect(assignmentSummaryCard).toHaveClass('invalid');
          expect(assignmentModal.getByText('Please check your learner emails and try again.')).toBeInTheDocument();
          expect(assignmentModal.queryByText('You haven\'t entered any learners yet.')).not.toBeInTheDocument();
          expect(assignmentModal.queryByText('Add learner emails to get started.')).not.toBeInTheDocument();
          expect(assignmentModal.queryByText('Total assignment cost')).not.toBeInTheDocument();
        } else {
          const totalAssignmentCostCard = assignmentModal.getByText('Total assignment cost').closest('.assignment-modal-total-assignment-cost-card');
          expect(totalAssignmentCostCard).toBeInTheDocument();
          expect(totalAssignmentCostCard).toHaveClass('invalid');
        }
        expect(assignmentModal.queryByText('Remaining after assignment')).not.toBeInTheDocument();

        // Verify "Assign" CTA is still disabled
        expect(getButtonElement('Assign', { screenOverride: assignmentModal })).toBeDisabled();
      } else {
        // Verify "Assign" CTA is enabled
        expect(getButtonElement('Assign', { screenOverride: assignmentModal })).not.toBeDisabled();
      }
    }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 1000 });
  });
});

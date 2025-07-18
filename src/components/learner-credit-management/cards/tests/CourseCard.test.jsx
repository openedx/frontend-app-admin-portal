import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import dayjs from 'dayjs';
import CourseCard from '../CourseCard';
import {
  DATETIME_FORMAT,
  formatPrice,
  getNormalizedEnrollByDate,
  learnerCreditManagementQueryKeys,
  SHORT_MONTH_DATE_FORMAT,
  useBudgetId,
  useSubsidyAccessPolicy,
  useEnterpriseFlexGroups,
  useCatalogContainsContentItemsMultipleQueries,
} from '../../data';
import { getButtonElement, queryClient } from '../../../test/testUtils';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';
import { EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY } from '../data';
import { getGroupMemberEmails } from '../../data/hooks/useEnterpriseFlexGroups';
import { ENTERPRISE_RESTRICTION_TYPE } from '../../data/constants';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({})),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    enterpriseSlug: 'test-enterprise-slug',
    enterpriseAppPage: 'test-enterprise-app',
  }),
}));

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  useBudgetId: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
  useEnterpriseFlexGroups: jest.fn(),
  useCatalogContainsContentItemsMultipleQueries: jest.fn(),
}));
jest.mock('../../data/hooks/useEnterpriseFlexGroups');
jest.mock('../../../../data/services/EnterpriseAccessApiService');

const futureStartDate = dayjs().add(10, 'days').toISOString();
const pastStartDate = dayjs().subtract(10, 'days').toISOString();
const enrollStartDate = dayjs().add(3, 'days').toISOString();
const enrollStartTimestamp = dayjs(enrollStartDate).unix();
const enrollByTimestamp = dayjs().add(5, 'days').unix();
const enrollByDropdownText = `Enroll by ${dayjs.unix(enrollByTimestamp).format(SHORT_MONTH_DATE_FORMAT)}`;

const originalData = {
  availability: ['Upcoming'],
  card_image_url: undefined,
  course_type: 'course',
  key: 'course-123x',
  normalized_metadata: {
    enroll_by_date: dayjs.unix(1892678399).toISOString(),
    start_date: futureStartDate,
    enroll_start_date: enrollStartDate,
    content_price: 100,
  },
  original_image_url: '',
  partners: [{ logo_image_url: '', name: 'Course Provider' }],
  title: 'Course Title',
  courseRuns: [
    {
      key: 'course-v1:edX+course-123x+3T2020',
      start: futureStartDate,
      upgrade_deadline: 1892678399,
      pacing_type: 'self_paced',
      enroll_by: enrollByTimestamp,
      has_enroll_by: true,
      enroll_start: enrollStartTimestamp,
      has_enroll_start: true,
      is_active: true,
      weeks_to_complete: 60,
      end: dayjs().add(1, 'years').toISOString(),
      content_price: '100',
    },
  ],
  advertised_course_run: {
    key: 'course-v1:edX+course-123x+3T2020',
    start: futureStartDate,
    upgrade_deadline: 1892678399,
    pacing_type: 'self_paced',
    enroll_by: enrollByTimestamp,
    has_enroll_by: true,
    enroll_start: enrollStartTimestamp,
    has_enroll_start: true,
    is_active: true,
    weeks_to_complete: 60,
    end: dayjs().add(1, 'year').toISOString(),
    content_price: '100',
  },
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
    enroll_by_date: dayjs.unix(1892678399).toISOString(),
    start_date: futureStartDate,
    content_price: 999,
  },
  courseRuns: [
    {
      key: 'course-v1:edX+course-123x+3T2020',
      start: futureStartDate,
      upgrade_deadline: 1892678399,
      pacing_type: 'instructor_paced',
      enroll_by: enrollByTimestamp,
      has_enroll_by: true,
      enroll_start: enrollStartTimestamp,
      has_enroll_start: true,
      is_active: true,
      weeks_to_complete: 60,
      end: dayjs().add(1, 'year').toISOString(),
      content_price: 999,
    },
  ],
  advertised_course_run: {
    key: 'course-v1:edX+course-123x+3T2020',
    start: futureStartDate,
    upgrade_deadline: 1892678399,
    pacing_type: 'instructor_paced',
    enroll_by: enrollByTimestamp,
    has_enroll_by: true,
    enroll_start: enrollStartTimestamp,
    has_enroll_start: true,
    is_active: true,
    weeks_to_complete: 60,
    end: dayjs().add(1, 'year').toISOString(),
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
  assignmentConfiguration: {
    uuid: 'test-assignment-configuration-uuid',
    active: true,
  },
  aggregates: {
    spendAvailableUsd: 50000,
  },
  subsidyExpirationDatetime: '2100-02-18T04:00:00Z',
  isLateRedemptionAllowed: false,
};
const mockLearnerEmails = ['hello@example.com', 'world@example.com', 'dinesh@example.com'];
const mockEnterpriseFlexGroup = [
  {
    enterpriseCustomer: 'test-enterprise-customer-1',
    name: 'Group 1',
    uuid: 'test-uuid',
    acceptedMembersCount: 2,
    groupType: 'flex',
    created: '2024-05-31T02:23:33.311109Z',
  },
  {
    enterpriseCustomer: 'test-enterprise-customer-2',
    name: 'Group 2',
    uuid: 'test-uuid-2',
    acceptedMembersCount: 1,
    groupType: 'flex',
    created: '2024-05-31T02:23:33.311109Z',
  },
];

const mockDisplaySuccessfulAssignmentToast = jest.fn();
const defaultBudgetDetailPageContextValue = {
  successfulAssignmentToast: {
    isSuccessfulAssignmentAllocationToastOpen: false,
    totalLearnersAssigned: undefined,
    displayToastForAssignmentAllocation: mockDisplaySuccessfulAssignmentToast,
    closeToastForAssignmentAllocation: jest.fn(),
  },
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

describe('CourseCard', () => {
  const mockAllocateContentAssignments = jest.spyOn(EnterpriseAccessApiService, 'allocateContentAssignments');

  // Helper function to find the assignment error modal after failed allocation attempt
  const getAssignmentErrorModal = () => within(screen.queryAllByRole('dialog')[1]);

  // Helper function to simulate clicking on "Try again" in error modal to retry allocation
  const simulateClickErrorModalTryAgain = async (modalTitle, assignmentErrorModal) => {
    const user = userEvent.setup();
    const tryAgainCTA = getButtonElement('Try again', { screenOverride: assignmentErrorModal });
    expect(tryAgainCTA).toBeInTheDocument();
    await user.click(tryAgainCTA);
    await waitFor(() => {
      // Verify modal closes
      expect(assignmentErrorModal.queryByText(modalTitle)).not.toBeInTheDocument();
    });
    expect(mockAllocateContentAssignments).toHaveBeenCalledTimes(2);
  };

  // Helper function to simulate clicking on "Exit and discard changes" in error modal to close ALL modals
  const simulateClickErrorModalExit = async (assignmentErrorModal) => {
    const user = userEvent.setup();
    const exitCTA = getButtonElement('Exit and discard changes', { screenOverride: assignmentErrorModal });
    await user.click(exitCTA);
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
      isLateRedemptionAllowed: false,
    });
    useEnterpriseFlexGroups.mockReturnValue({
      data: mockEnterpriseFlexGroup,
    });
    useCatalogContainsContentItemsMultipleQueries.mockReturnValue({
      data: {},
      dataByContentKey: {},
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('course card renders', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);
    expect(screen.getByText(defaultProps.original.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.original.partners[0].name)).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    await user.click(screen.getByText('Assign'));
    expect(screen.getByText('Per learner price')).toBeInTheDocument();
    expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
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

  test('card renders given image', async () => {
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

  test('executive education card renders', async () => {
    const user = userEvent.setup();
    const enrollByDate = getNormalizedEnrollByDate(dayjs.unix(enrollByTimestamp).toISOString());
    const formattedEnrollBy = dayjs(enrollByDate).format(SHORT_MONTH_DATE_FORMAT);
    renderWithRouter(<CourseCardWrapper {...execEdProps} />);
    expect(screen.queryByText('$999')).toBeInTheDocument();
    await user.click(screen.getByText('Assign'));
    expect(screen.getByText(`Enroll by ${formattedEnrollBy}`)).toBeInTheDocument();
    expect(screen.queryByText('Executive Education')).toBeInTheDocument();
    const viewCourseCTA = screen.getByText('View course', { selector: 'a' });
    expect(viewCourseCTA.href).toContain('https://enterprise.stage.edx.org/test-enterprise-slug/executive-education-2u/course/exec-ed-course-123x');
  });

  test('view course sends segment events', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CourseCardWrapper {...execEdProps} />);
    const viewCourseCTA = screen.getByText('View course', { selector: 'a' });
    await user.click(viewCourseCTA);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });

  test('card exits and sends segment events', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);

    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
    await user.click(assignCourseCTA);
    expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
    await user.click(screen.getByText(enrollByDropdownText));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    const assignmentModal = within(screen.getByRole('dialog'));
    expect(assignmentModal.getByText('Assign this course')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  test('help center article link sends segment events', async () => {
    const user = userEvent.setup();
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);

    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
    await user.click(assignCourseCTA);
    expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
    await user.click(screen.getByText(enrollByDropdownText));
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);

    const helpCenterButton = screen.getByText('Help Center: Course Assignments');

    expect(helpCenterButton).toBeInTheDocument();
    await user.click(helpCenterButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });

  describe('assignments submission', () => {
    const setupAssignments = ({
      hasAllocationException,
      allocationExceptionReason,
      courseImportantDates,
    }) => {
      const mockUpdatedLearnerAssignments = [mockLearnerEmails[0]];
      const mockNoChangeLearnerAssignments = [mockLearnerEmails[1]];
      const mockCreatedLearnerAssignments = mockLearnerEmails.slice(2).map(learnerEmail => ({
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
      }));

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
            updated: mockUpdatedLearnerAssignments,
            created: mockCreatedLearnerAssignments,
            no_change: mockNoChangeLearnerAssignments,
          },
        });
      }
      const mockInvalidateQueries = jest.fn();
      useQueryClient.mockReturnValue({
        invalidateQueries: mockInvalidateQueries,
      });
      const {
        courseStartDate, expectedCourseStartText,
      } = courseImportantDates;
      const props = {
        original: {
          ...defaultProps.original,
          normalized_metadata: {
            ...defaultProps.original.normalized_metadata,
            start_date: courseStartDate,
          },
          courseRuns: [{
            ...defaultProps.original.courseRuns[0],
            start: courseStartDate,
          },
          ],
          advertised_course_run: {
            ...defaultProps.original.advertised_course_run,
            start: courseStartDate,
          },
        },
      };
      return {
        props,
        expectedCourseStartText,
        courseStartDate,
        mockInvalidateQueries,
        mockCreatedLearnerAssignments,
        mockUpdatedLearnerAssignments,
        mockNoChangeLearnerAssignments,
      };
    };

    test.each([
      {
        shouldSubmitAssignments: true,
        hasAllocationException: true,
        allocationExceptionReason: 'content_not_in_catalog',
        shouldRetryAllocationAfterException: false, // no ability to retry after this error
        courseImportantDates: {
          courseStartDate: futureStartDate,
          expectedCourseStartText: 'Course starts:',
        },
      },
      {
        shouldSubmitAssignments: true,
        hasAllocationException: true,
        allocationExceptionReason: 'not_enough_value_in_subsidy',
        shouldRetryAllocationAfterException: false,
        courseImportantDates: {
          courseStartDate: pastStartDate,
          expectedCourseStartText: 'Course started:',
        },
      },
      {
        shouldSubmitAssignments: true,
        hasAllocationException: true,
        allocationExceptionReason: 'not_enough_value_in_subsidy',
        shouldRetryAllocationAfterException: true,
        courseImportantDates: {
          courseStartDate: futureStartDate,
          expectedCourseStartText: 'Course starts:',
        },
      },
      {
        shouldSubmitAssignments: true,
        hasAllocationException: true,
        allocationExceptionReason: 'policy_spend_limit_reached',
        shouldRetryAllocationAfterException: false,
        courseImportantDates: {
          courseStartDate: pastStartDate,
          expectedCourseStartText: 'Course started:',
        },
      },
      {
        shouldSubmitAssignments: true,
        hasAllocationException: true,
        allocationExceptionReason: 'policy_spend_limit_reached',
        shouldRetryAllocationAfterException: true,
        courseImportantDates: {
          courseStartDate: futureStartDate,
          expectedCourseStartText: 'Course starts:',
        },
      },
      {
        shouldSubmitAssignments: true,
        hasAllocationException: true,
        allocationExceptionReason: null,
        shouldRetryAllocationAfterException: false,
        courseImportantDates: {
          courseStartDate: pastStartDate,
          expectedCourseStartText: 'Course started:',
        },
      },
      {
        shouldSubmitAssignments: true,
        hasAllocationException: true,
        allocationExceptionReason: null,
        shouldRetryAllocationAfterException: true,
        courseImportantDates: {
          courseStartDate: futureStartDate,
          expectedCourseStartText: 'Course starts:',
        },
      },
      {
        shouldSubmitAssignments: true,
        hasAllocationException: false,
        courseImportantDates: {
          courseStartDate: null,
          expectedCourseStartText: '',
        },
      },
      {
        shouldSubmitAssignments: false,
        hasAllocationException: false,
        courseImportantDates: {
          courseStartDate: null,
          expectedCourseStartText: '',
        },
      },
    ])('opens assignment modal, fills out information, and submits assignments accordingly - with success or with an exception (%s)', async ({
      shouldSubmitAssignments,
      hasAllocationException,
      allocationExceptionReason,
      shouldRetryAllocationAfterException,
      courseImportantDates,
    }) => {
      const user = userEvent.setup();
      const {
        props, expectedCourseStartText, courseStartDate, mockInvalidateQueries,
        mockCreatedLearnerAssignments,
        mockUpdatedLearnerAssignments,
        mockNoChangeLearnerAssignments,
      } = setupAssignments({
        hasAllocationException,
        allocationExceptionReason,
        courseImportantDates,
      });

      renderWithRouter(<CourseCardWrapper {...props} />);

      const assignCourseCTA = getButtonElement('Assign');
      expect(assignCourseCTA).toBeInTheDocument();

      await user.click(assignCourseCTA);
      expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
      await user.click(screen.getByText(enrollByDropdownText));

      const assignmentModal = within(screen.getByRole('dialog'));

      expect(assignmentModal.getByText('Assign this course')).toBeInTheDocument();
      expect(assignmentModal.getByText('Use Learner Credit to assign this course')).toBeInTheDocument();

      // Verify course card is displayed WITHOUT footer actions
      const modalCourseCard = within(assignmentModal.getByText('Course Title').closest('.pgn__card'));
      expect(modalCourseCard.getByText(defaultProps.original.title)).toBeInTheDocument();
      expect(modalCourseCard.getByText(defaultProps.original.partners[0].name)).toBeInTheDocument();
      expect(modalCourseCard.getByText('$100')).toBeInTheDocument();
      expect(modalCourseCard.getByText('Per learner price')).toBeInTheDocument();
      expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
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
      expect(assignmentModal.getByText("You haven't entered any learners yet.")).toBeInTheDocument();
      expect(assignmentModal.getByText('Add learner emails to get started.')).toBeInTheDocument();
      expect(assignmentModal.getByText(`Learner Credit Budget: ${mockSubsidyAccessPolicy.displayName}`)).toBeInTheDocument();
      expect(assignmentModal.getByText('Available balance')).toBeInTheDocument();
      const expectedAvailableBalance = formatPrice(mockSubsidyAccessPolicy.aggregates.spendAvailableUsd);
      expect(assignmentModal.getByText(expectedAvailableBalance)).toBeInTheDocument();

      // Verify important dates
      expect(assignmentModal.getByText('Enroll-by date:')).toBeInTheDocument();
      expect(assignmentModal.getByText(
        dayjs.unix(enrollByTimestamp).format(DATETIME_FORMAT),
      )).toBeInTheDocument();
      if (courseStartDate) {
        expect(assignmentModal.getByText(expectedCourseStartText)).toBeInTheDocument();
        expect(assignmentModal.getByText(
          dayjs(courseStartDate).format(SHORT_MONTH_DATE_FORMAT),
        )).toBeInTheDocument();
      }

      // Verify collapsible
      expect(assignmentModal.getByText('How assigning this course works')).toBeInTheDocument();
      expect(assignmentModal.getByText('Next steps for assigned learners')).toBeInTheDocument();
      expect(assignmentModal.getByText('Learners will be notified of this course assignment by email.')).toBeInTheDocument();
      const budgetImpact = assignmentModal.getByText('Impact on your Learner Credit budget');
      expect(budgetImpact).toBeInTheDocument();
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
      expect(assignmentModal.queryByText('The total assignment cost will be earmarked as "assigned" funds', { exact: false })).not.toBeInTheDocument();
      await user.click(budgetImpact);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
      expect(assignmentModal.getByText('The total assignment cost will be earmarked as "assigned" funds', { exact: false })).toBeInTheDocument();
      const managingAssignment = assignmentModal.getByText('Managing this assignment');
      expect(managingAssignment).toBeInTheDocument();
      expect(assignmentModal.queryByText('You will be able to monitor the status of this assignment', { exact: false })).not.toBeInTheDocument();
      await user.click(managingAssignment);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(3);
      expect(assignmentModal.getByText('You will be able to monitor the status of this assignment', { exact: false })).toBeInTheDocument();
      const nextSteps = assignmentModal.getByText('Next steps for assigned learners');
      await user.click(nextSteps);
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(4);

      // Verify modal footer
      expect(assignmentModal.getByText('Help Center: Course Assignments')).toBeInTheDocument();
      const cancelAssignmentCTA = getButtonElement('Cancel', { screenOverride: assignmentModal });
      expect(cancelAssignmentCTA).toBeInTheDocument();
      const submitAssignmentCTA = getButtonElement('Assign', { screenOverride: assignmentModal });
      expect(submitAssignmentCTA).toBeInTheDocument();

      if (shouldSubmitAssignments) {
      // Verify textarea receives input
        await user.type(textareaInput, mockLearnerEmails.join('{enter}'));
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
        const expectedAssignmentCost = (
          mockLearnerEmails.length * defaultProps.original.normalized_metadata.content_price
        );
        expect(assignmentModal.getByText(formatPrice(expectedAssignmentCost))).toBeInTheDocument();
        expect(assignmentModal.getByText('Remaining after assignment')).toBeInTheDocument();
        const expectedBalanceAfterAssignment = (
          mockSubsidyAccessPolicy.aggregates.spendAvailableUsd - expectedAssignmentCost
        );
        expect(assignmentModal.getByText(formatPrice(expectedBalanceAfterAssignment))).toBeInTheDocument();

        // Verify assignment is submitted successfully
        await user.click(submitAssignmentCTA);
        await waitFor(() => expect(mockAllocateContentAssignments).toHaveBeenCalledTimes(1));
        expect(mockAllocateContentAssignments).toHaveBeenCalledWith(
          mockSubsidyAccessPolicy.uuid,
          expect.objectContaining({
            content_price_cents: 10000,
            content_key: 'course-v1:edX+course-123x+3T2020',
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
            await user.click(exitCTA);
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
          expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
          expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: learnerCreditManagementQueryKeys.budget(mockSubsidyAccessPolicy.uuid),
          });
          expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: learnerCreditManagementQueryKeys.budgets(enterpriseUUID),
          });
          // TODO: Fix
          // expect(getButtonElement('Assigned', { screenOverride: assignmentModal }))
          // .toHaveAttribute('aria-disabled', 'true');
          await waitFor(() => {
          // Verify all modals close (error modal + assignment modal)
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            // Verify toast notification was displayed
            expect(mockDisplaySuccessfulAssignmentToast).toHaveBeenCalledTimes(1);
            expect(mockDisplaySuccessfulAssignmentToast).toHaveBeenCalledWith({
              totalLearnersAllocated: mockCreatedLearnerAssignments.length + mockUpdatedLearnerAssignments.length,
              totalLearnersAlreadyAllocated: mockNoChangeLearnerAssignments.length,
            });
          });
        }
      } else {
      // Otherwise, verify modal closes when cancel button is clicked
        await user.click(cancelAssignmentCTA);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }
    });

    test('prevents allocation if emails are empty', async () => {
      const user = userEvent.setup();
      const hasAllocationException = false;
      const courseImportantDates = {
        courseStartDate: null,
        expectedCourseStartText: '',
      };
      const {
        props,
      } = setupAssignments({
        hasAllocationException,
        allocationExceptionReason: undefined,
        courseImportantDates,
      });

      renderWithRouter(<CourseCardWrapper {...props} />);

      const assignCourseCTA = getButtonElement('Assign');
      expect(assignCourseCTA).toBeInTheDocument();

      await user.click(assignCourseCTA);
      expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
      await user.click(screen.getByText(enrollByDropdownText));

      const assignmentModal = within(screen.getByRole('dialog'));

      // Verify empty state
      expect(assignmentModal.getByText('Assign to')).toBeInTheDocument();
      const textareaInputLabel = assignmentModal.getByLabelText('Learner email addresses');
      expect(textareaInputLabel).toBeInTheDocument();
      const textareaInput = textareaInputLabel.closest('textarea');
      expect(textareaInput).toBeInTheDocument();

      const submitAssignmentCTA = getButtonElement('Assign', { screenOverride: assignmentModal });
      expect(submitAssignmentCTA).toBeInTheDocument();

      expect(submitAssignmentCTA).toBeDisabled();

      // Test user adding email addresses by typing into the input field
      await user.type(textareaInput, mockLearnerEmails.join('{enter}'));
      expect(textareaInput).toHaveValue(mockLearnerEmails.join('\n'));

      await waitFor(() => {
        expect(assignmentModal.getByText(`Summary (${mockLearnerEmails.length})`)).toBeInTheDocument();
      }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 100 });

      await waitFor(() => {
        const submitAssignmentCTA2 = getButtonElement('Assign', { screenOverride: assignmentModal });
        expect(submitAssignmentCTA2).toBeInTheDocument();
        // Verify that assign button in footer is enabled
        expect(submitAssignmentCTA).not.toBeDisabled();
      });

      // Test user deleting the input field content by typing backspace
      await user.type(textareaInput, '{backspace}'.repeat(mockLearnerEmails.join('\n').length));
      expect(textareaInput).toHaveValue('');

      await waitFor(() => {
        expect(assignmentModal.queryByText(`Summary (${mockLearnerEmails.length})`)).not.toBeInTheDocument();
      }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 100 });

      await waitFor(() => {
        const submitAssignmentCTA2 = getButtonElement('Assign', { screenOverride: assignmentModal });
        expect(submitAssignmentCTA2).toBeInTheDocument();
        // Verify that assign button in footer is enabled
        expect(submitAssignmentCTA2).toBeDisabled();
      });
    });

    test('allows allocation if groups are assigned but emails are empty', async () => {
      const user = userEvent.setup();
      const hasAllocationException = false;
      const courseImportantDates = {
        courseStartDate: null,
        expectedCourseStartText: '',
      };
      const {
        props,
      } = setupAssignments({
        hasAllocationException,
        allocationExceptionReason: undefined,
        courseImportantDates,
      });

      useSubsidyAccessPolicy.mockReturnValue({
        data: {
          ...mockSubsidyAccessPolicy,
          aggregates: {
            ...mockSubsidyAccessPolicy.aggregates,
            spendAvailableUsd: 1000,
          },
        },
        isLoading: false,
      });

      getGroupMemberEmails.mockReturnValue(['email@example.com', 'jhodge@example.com', '123@example.com']);
      renderWithRouter(<CourseCardWrapper {...props} />);
      const assignCourseCTA = getButtonElement('Assign');
      expect(assignCourseCTA).toBeInTheDocument();

      await user.click(assignCourseCTA);
      expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
      await user.click(screen.getByText(enrollByDropdownText));

      const assignmentModal = within(screen.getByRole('dialog'));

      // Verify empty state
      expect(assignmentModal.getByText('Assign to')).toBeInTheDocument();
      const textareaInputLabel = assignmentModal.getByLabelText('Learner email addresses');
      expect(textareaInputLabel).toBeInTheDocument();
      const textareaInput = textareaInputLabel.closest('textarea');
      expect(textareaInput).toBeInTheDocument();

      const submitAssignmentCTA = getButtonElement('Assign', { screenOverride: assignmentModal });
      expect(submitAssignmentCTA).toBeInTheDocument();

      expect(submitAssignmentCTA).toBeDisabled();

      expect(
        assignmentModal.getByText('Select one or more group to add its members to the assignment.'),
      ).toBeInTheDocument();
      const dropdownMenu = assignmentModal.getByText('Select group');
      expect(dropdownMenu).toBeInTheDocument();
      await user.click(dropdownMenu);
      const group1 = assignmentModal.getByText('Group 1 (2)');
      const group2 = assignmentModal.getByText('Group 2 (1)');
      expect(group1).toBeInTheDocument();
      expect(group2).toBeInTheDocument();

      await user.click(group1);
      await user.click(group2);
      const applyButton = assignmentModal.getByText('Apply selections');

      await waitFor(() => {
        user.click(applyButton);
        expect(assignmentModal.getByText('2 groups selected')).toBeInTheDocument();
        expect(assignmentModal.getByText('email@example.com')).toBeInTheDocument();
      });

      // Test user adding email addresses by typing into the input field
      await user.type(textareaInput, mockLearnerEmails.join('{enter}'));
      expect(textareaInput).toHaveValue(mockLearnerEmails.join('\n'));

      await waitFor(() => {
        expect(assignmentModal.getByText(`Summary (${3 + mockLearnerEmails.length})`)).toBeInTheDocument();
      }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 100 });

      await waitFor(() => {
        const submitAssignmentCTA2 = getButtonElement('Assign', { screenOverride: assignmentModal });
        expect(submitAssignmentCTA2).toBeInTheDocument();
        // Verify that assign button in footer is enabled
        expect(submitAssignmentCTA).not.toBeDisabled();
      });

      // Test user deleting the input field content by typing backspace
      await user.type(textareaInput, '{backspace}'.repeat(mockLearnerEmails.join('\n').length));
      expect(textareaInput).toHaveValue('');

      await waitFor(() => {
        expect(assignmentModal.queryByText('Summary (3)')).toBeInTheDocument();
      }, { timeout: EMAIL_ADDRESSES_INPUT_VALUE_DEBOUNCE_DELAY + 100 });

      await waitFor(() => {
        const submitAssignmentCTA2 = getButtonElement('Assign', { screenOverride: assignmentModal });
        expect(submitAssignmentCTA2).toBeInTheDocument();
        // Verify that assign button in footer is enabled
        expect(submitAssignmentCTA2).not.toBeDisabled();
      });
    }, 20000);
  });

  test.each([
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
      learnerEmails: ['a@a.com', 'b@b.com', 'c@c.com', 'B@b.com'],
      spendAvailableUsd: 1000,
      expectedValidationMessage: 'B@b.com has been entered more than once.',
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
      learnerEmails: ['a@a.com', 'B@b.com', 'c@c.com'],
      spendAvailableUsd: 1000,
      expectedValidationMessage: undefined, // no validation error
    },
  ])('opens assignment modal, fills out information, and handles client-side validation (%s)', async ({
    learnerEmails,
    spendAvailableUsd,
    expectedValidationMessage,
  }) => {
    const user = userEvent.setup();
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
    await user.click(assignCourseCTA);
    expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
    await user.click(screen.getByText(enrollByDropdownText));
    const assignmentModal = within(screen.getByRole('dialog'));

    // Verify "Assign" CTA is disabled
    expect(getButtonElement('Assign', { screenOverride: assignmentModal })).toBeDisabled();

    // Verify textarea receives input
    const textareaInputLabel = assignmentModal.getByLabelText('Learner email addresses');
    expect(textareaInputLabel).toBeInTheDocument();
    const textareaInput = textareaInputLabel.closest('textarea');
    expect(textareaInput).toBeInTheDocument();
    await user.type(textareaInput, learnerEmails.join('{enter}'));
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

  test('opens assignment modal and selects flex group assignments', async () => {
    const user = userEvent.setup();
    useSubsidyAccessPolicy.mockReturnValue({
      data: {
        ...mockSubsidyAccessPolicy,
        aggregates: {
          ...mockSubsidyAccessPolicy.aggregates,
          spendAvailableUsd: 1000,
        },
      },
      isLoading: false,
    });
    getGroupMemberEmails.mockReturnValue(mockLearnerEmails);
    renderWithRouter(<CourseCardWrapper {...defaultProps} />);
    const assignCourseCTA = getButtonElement('Assign');
    expect(assignCourseCTA).toBeInTheDocument();
    await user.click(assignCourseCTA);
    expect(screen.getByText(enrollByDropdownText)).toBeInTheDocument();
    await user.click(screen.getByText(enrollByDropdownText));
    const assignmentModal = within(screen.getByRole('dialog'));

    // Verify "Assign" CTA is disabled
    expect(getButtonElement('Assign', { screenOverride: assignmentModal })).toBeDisabled();

    // Verify dropdown menu
    expect(
      assignmentModal.getByText('Select one or more group to add its members to the assignment.'),
    ).toBeInTheDocument();
    const dropdownMenu = assignmentModal.getByText('Select group');
    expect(dropdownMenu).toBeInTheDocument();
    await user.click(dropdownMenu);
    const group1 = assignmentModal.getByText('Group 1 (2)');
    const group2 = assignmentModal.getByText('Group 2 (1)');
    expect(group1).toBeInTheDocument();
    expect(group2).toBeInTheDocument();

    await user.click(group1);
    await user.click(group2);
    const applyButton = assignmentModal.getByText('Apply selections');

    await waitFor(() => {
      user.click(applyButton);
      expect(assignmentModal.getByText('2 groups selected')).toBeInTheDocument();
      expect(assignmentModal.getByText('hello@example.com')).toBeInTheDocument();
      expect(assignmentModal.getByText('world@example.com')).toBeInTheDocument();
      expect(assignmentModal.getByText('dinesh@example.com')).toBeInTheDocument();
    });
  });

  test.each([
    // The "pure" case, i.e. course contains only unrestricted runs.
    {
      runs: [
        originalData.courseRuns[0],
      ],
      containsContentItemsMockDataByContentKey: {},
      containsContentItemsIsLoading: false,
      expectedCoursePriceSkeleton: false,
      expectedNumRunSkeletons: 0,
      expectedAssignableEnrollByDates: [
        originalData.courseRuns[0].enroll_by,
      ],
    },
    // The "mixed" case, i.e. course contains both restricted and unrestricted runs.
    {
      runs: [
        originalData.courseRuns[0],
        {
          ...originalData.courseRuns[0],
          restrictionType: ENTERPRISE_RESTRICTION_TYPE,
          key: 'course-v1:edX+course-123x+3T2020.restricted',
          start: dayjs(futureStartDate).add(10, 'days').toISOString(),
          enroll_by: dayjs.unix(enrollByTimestamp).add(10, 'days').unix(),
          enroll_start: dayjs.unix(enrollStartTimestamp).add(10, 'days').unix(),
          content_price: '100',
        },
      ],
      containsContentItemsMockDataByContentKey: {
        'course-v1:edX+course-123x+3T2020.restricted': { containsContentItems: true },
      },
      containsContentItemsIsLoading: false,
      expectedCoursePriceSkeleton: false,
      expectedNumRunSkeletons: 0,
      expectedAssignableEnrollByDates: [
        originalData.courseRuns[0].enroll_by,
        dayjs.unix(enrollByTimestamp).add(10, 'days').unix(),
      ],
    },
    // The "unicorn course" case, i.e. course contains only restricted runs.
    {
      runs: [
        {
          ...originalData.courseRuns[0],
          restrictionType: ENTERPRISE_RESTRICTION_TYPE,
          key: 'course-v1:edX+course-123x+3T2020.restricted',
          start: dayjs(futureStartDate).add(10, 'days').toISOString(),
          enroll_by: dayjs.unix(enrollByTimestamp).add(10, 'days').unix(),
          enroll_start: dayjs.unix(enrollStartTimestamp).add(10, 'days').unix(),
          content_price: '100',
        },
      ],
      containsContentItemsMockDataByContentKey: {
        'course-v1:edX+course-123x+3T2020.restricted': { containsContentItems: true },
      },
      containsContentItemsIsLoading: false,
      expectedCoursePriceSkeleton: false,
      expectedNumRunSkeletons: 0,
      expectedAssignableEnrollByDates: [
        dayjs.unix(enrollByTimestamp).add(10, 'days').unix(),
      ],
    },
    // Ensure skeletons appear when the contains_content_items API calls are still loading.
    {
      runs: [
        originalData.courseRuns[0],
        {
          ...originalData.courseRuns[0],
          restrictionType: ENTERPRISE_RESTRICTION_TYPE,
          key: 'course-v1:edX+course-123x+3T2020.restricted',
          start: dayjs(futureStartDate).add(10, 'days').toISOString(),
          enroll_by: dayjs.unix(enrollByTimestamp).add(10, 'days').unix(),
          enroll_start: dayjs.unix(enrollStartTimestamp).add(10, 'days').unix(),
          content_price: '100',
        },
      ],
      containsContentItemsMockDataByContentKey: {
        // undefined is meant to simulate that data is still loading.
        'course-v1:edX+course-123x+3T2020.restricted': undefined,
      },
      containsContentItemsIsLoading: true,
      expectedCoursePriceSkeleton: true,
      // The number of run skeletons that appear in the Assign drop-down should
      // be equal to the number of _unrestricted_ runs. getAssignableCourseRuns
      // initially won't assume that the restricted runs are assignable, so
      // won't return them to be counted.
      expectedNumRunSkeletons: 1,
      expectedAssignableEnrollByDates: [],
    },
  ])('course card renders assignable restricted runs (%s)', async ({
    runs,
    containsContentItemsMockDataByContentKey,
    containsContentItemsIsLoading,
    expectedCoursePriceSkeleton,
    expectedNumRunSkeletons,
    expectedAssignableEnrollByDates,
  }) => {
    const user = userEvent.setup();
    getConfig.mockReturnValue({
      FEATURE_ENABLE_RESTRICTED_RUN_ASSIGNMENT: true,
    });
    const data = {
      ...originalData,
      courseRuns: runs,
      advertised_course_run: runs[0],
      normalized_metadata: {
        enroll_by_date: dayjs.unix(runs[0].upgrade_deadline).toISOString(),
        start_date: runs[0].start,
        enroll_start_date: enrollStartDate,
        content_price: runs[0].content_price,
      },
    };
    const props = {
      original: data,
    };
    useCatalogContainsContentItemsMultipleQueries.mockReturnValue({
      dataByContentKey: containsContentItemsMockDataByContentKey,
      isLoading: containsContentItemsIsLoading,
    });

    renderWithRouter(<CourseCardWrapper {...props} />);
    if (expectedCoursePriceSkeleton) {
      expect(screen.queryByTestId('course-price-skeleton')).toBeInTheDocument();
      await user.click(screen.getByText('Assign'));
      await waitFor(() => {
        expect(screen.queryAllByTestId('assignment-dropdown-item-skeleton').length).toBe(expectedNumRunSkeletons);
      });
    } else {
      expect(screen.queryByTestId('course-price-skeleton')).not.toBeInTheDocument();
      await user.click(screen.getByText('Assign'));
      await waitFor(() => {
        expectedAssignableEnrollByDates.forEach((enrollByDate) => {
          expect(screen.getByText(
            `Enroll by ${dayjs.unix(enrollByDate).format(SHORT_MONTH_DATE_FORMAT)}`,
          )).toBeInTheDocument();
        });
      });
    }
  });
});

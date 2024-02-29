import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-hooks/dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { v4 as uuidv4 } from 'uuid';

import useBudgetRedemptions from '../useBudgetRedemptions';
import useSubsidyAccessPolicy from '../useSubsidyAccessPolicy';
import EnterpriseDataApiService from '../../../../../data/services/EnterpriseDataApiService';
import SubsidyApiService from '../../../../../data/services/EnterpriseSubsidyApiService';
import { queryClient } from '../../../../test/testUtils';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_OFFER_ID = 1;
const subsidyUuid = uuidv4();
const transactionUuid = uuidv4();
const courseTitle = 'Test Course Title';
const courseKey = 'edX+test';
const courseRunKey = `course-v1:${courseKey}+course.1`;
const userEmail = 'edx@example.com';

const mockOfferEnrollments = [{
  user_email: userEmail,
  course_title: courseTitle,
  course_list_price: '100.00',
  enrollment_date: '2022-01-01',
}];

const mockOfferEnrollmentsResponse = {
  count: 100,
  current_page: 1,
  num_pages: 5,
  results: mockOfferEnrollments,
};

const mockSubsidyTransactionResponse = {
  count: 100,
  current_page: 1,
  num_pages: 5,
  results: [{
    uuid: transactionUuid,
    state: 'committed',
    idempotency_key: 'does-not-matter',
    lms_user_id: 999,
    lms_user_email: userEmail,
    content_key: courseRunKey,
    parent_content_key: courseKey,
    content_title: courseTitle,
    quantity: -1500,
    unit: 'usd_cents',
  }],
};

const mockEnterpriseOffer = {
  id: TEST_ENTERPRISE_OFFER_ID,
};

jest.mock('../useSubsidyAccessPolicy');
jest.mock('../../../../../data/services/EnterpriseDataApiService');
jest.mock('../../../../../data/services/EnterpriseSubsidyApiService');

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

describe('useBudgetRedemptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      budgetId: 'test-budget-id',
      offerId: undefined,
      isTopDownAssignmentEnabled: true,
    },
    {
      budgetId: 'test-budget-id',
      offerId: undefined,
      isTopDownAssignmentEnabled: false,
    },
    {
      budgetId: undefined,
      offerId: mockEnterpriseOffer.id,
      isTopDownAssignmentEnabled: false,
    },
  ])('should fetch enrollment/redemptions metadata for budget (%s)', async ({
    budgetId,
    offerId,
    isTopDownAssignmentEnabled,
  }) => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValueOnce({ data: mockOfferEnrollmentsResponse });
    SubsidyApiService.fetchCustomerTransactions.mockResolvedValueOnce({ data: mockSubsidyTransactionResponse });
    useSubsidyAccessPolicy.mockReturnValue({ data: { subsidyUuid } });

    const { result, waitForNextUpdate } = renderHook(
      () => useBudgetRedemptions(TEST_ENTERPRISE_UUID, offerId, budgetId, isTopDownAssignmentEnabled),
      { wrapper },
    );

    expect(result.current).toMatchObject({
      budgetRedemptions: {
        itemCount: 0,
        pageCount: 0,
        results: [],
      },
      isLoading: true,
      fetchBudgetRedemptions: expect.any(Function),
    });
    act(() => {
      result.current.fetchBudgetRedemptions({
        pageIndex: 0, // `DataTable` uses zero-based indexing
        pageSize: 20,
        sortBy: [
          { id: 'enrollmentDate', desc: true },
        ],
        filters: [
          { id: 'enrollmentDetails', value: mockOfferEnrollments[0].user_email },
        ],
      });
    });

    await waitForNextUpdate();

    if (budgetId && isTopDownAssignmentEnabled) {
      const expectedApiOptions = {
        page: 1,
        pageSize: 20,
        ordering: '-enrollment_date', // default sort order
        search: mockOfferEnrollments[0].user_email,
        subsidyAccessPolicyUuid: budgetId,
      };
      expect(SubsidyApiService.fetchCustomerTransactions).toHaveBeenCalledWith(
        subsidyUuid,
        expectedApiOptions,
      );
    } else {
      const expectedApiOptions = {
        page: 1,
        pageSize: 20,
        offerId,
        ordering: '-enrollment_date', // default sort order
        searchAll: mockOfferEnrollments[0].user_email,
        ignoreNullCourseListPrice: true,
        budgetId,
      };
      expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
        TEST_ENTERPRISE_UUID,
        expectedApiOptions,
      );
    }

    const mockExpectedResultsObj = isTopDownAssignmentEnabled ? [{
      courseListPrice: 15,
      courseKey,
      courseTitle,
      userEmail,
    }] : camelCaseObject(mockOfferEnrollments);

    expect(result.current).toMatchObject({
      budgetRedemptions: {
        itemCount: 100,
        pageCount: 5,
        results: mockExpectedResultsObj,
      },
      isLoading: false,
      fetchBudgetRedemptions: expect.any(Function),
    });
  });
});

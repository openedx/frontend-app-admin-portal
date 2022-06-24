import { act, renderHook } from '@testing-library/react-hooks/dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import {
  useOfferSummary,
  useLearnerCreditAllocations,
} from '../hooks';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    FEATURE_LEARNER_CREDIT_MANAGEMENT: true,
  })),
}));
jest.mock('../../../../data/services/EnterpriseDataApiService');

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_OFFER_ID = 1;

const mockOfferSummary = {
  offer_id: TEST_ENTERPRISE_OFFER_ID,
  status: 'Open',
  enterprise_customer_uuid: TEST_ENTERPRISE_UUID,
  amount_of_offer_spent: '200.00',
  max_discount: '5000.00',
  percent_of_offer_spent: '0.04',
  remaining_balance: '4800.00',
};
const mockEnterpriseOffer = {
  id: TEST_ENTERPRISE_OFFER_ID,
};
const mockOfferEnrollments = [{
  user_email: 'edx@example.com',
  course_title: 'Test Course Title',
  course_list_price: '100.00',
  enrollment_date: '2022-01-01',
}];

const mockOfferEnrollmentsResponse = {
  count: 100,
  current_page: 1,
  num_pages: 5,
  results: mockOfferEnrollments,
};

describe('useOfferSummary', () => {
  it('should handle null enterprise offer', async () => {
    const { result } = renderHook(() => useOfferSummary(TEST_ENTERPRISE_UUID));

    expect(result.current).toEqual({
      offerSummary: undefined,
      isLoading: false,
    });
  });

  it('should fetch summary data for enterprise offer', async () => {
    EnterpriseDataApiService.fetchEnterpriseOfferSummary.mockResolvedValueOnce({ data: mockOfferSummary });
    const { result, waitForNextUpdate } = renderHook(() => useOfferSummary(
      TEST_ENTERPRISE_UUID, mockEnterpriseOffer,
    ));

    expect(result.current).toEqual({
      offerSummary: undefined,
      isLoading: true,
    });

    await waitForNextUpdate();

    expect(EnterpriseDataApiService.fetchEnterpriseOfferSummary).toHaveBeenCalled();
    const expectedResult = {
      totalFunds: 5000,
      redeemedFunds: 200,
      remainingFunds: 4800,
      percentUtilized: 0.04,
    };
    expect(result.current).toEqual({
      offerSummary: expectedResult,
      isLoading: false,
    });
  });
});

describe('useLearnerCreditAllocations', () => {
  it('should fetch enrollment/redemptions metadata for enterprise offer', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValueOnce({ data: mockOfferEnrollmentsResponse });
    const { result, waitForNextUpdate } = renderHook(() => useLearnerCreditAllocations(
      TEST_ENTERPRISE_UUID,
      mockEnterpriseOffer.id,
    ));

    expect(result.current).toMatchObject({
      tableData: {
        itemCount: 0,
        pageCount: 0,
        results: [],
      },
      isLoading: true,
      fetchTableData: expect.any(Function),
    });
    act(() => {
      result.current.fetchTableData({
        pageIndex: 0, // `DataTable` uses zero-based indexing
        pageSize: 20,
        sortBy: [
          { id: 'enrollmentDate', desc: true },
        ],
        filters: [
          { id: 'userEmail', value: mockOfferEnrollments[0].user_email },
          { id: 'courseTitle', value: mockOfferEnrollments[0].course_title },
        ],
      });
    });

    await waitForNextUpdate();

    const expectedApiOptions = {
      page: 1,
      pageSize: 20,
      offerId: mockEnterpriseOffer.id,
      ordering: '-enrollment_date',
      search: mockOfferEnrollments[0].user_email,
      searchCourse: mockOfferEnrollments[0].course_title,
    };
    expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      expectedApiOptions,
    );
    expect(result.current).toMatchObject({
      tableData: {
        itemCount: 100,
        pageCount: 5,
        results: camelCaseObject(mockOfferEnrollments),
      },
      isLoading: false,
      fetchTableData: expect.any(Function),
    });
  });
});

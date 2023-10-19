import { act, renderHook } from '@testing-library/react-hooks/dom';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import useOfferRedemptions from './useOfferRedemptions';
import EnterpriseDataApiService from '../../../../data/services/EnterpriseDataApiService';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_ENTERPRISE_OFFER_ID = 1;

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

const mockEnterpriseOffer = {
  id: TEST_ENTERPRISE_OFFER_ID,
};

jest.mock('../../../../data/services/EnterpriseDataApiService');

describe('useOfferRedemptions', () => {
  it('should fetch enrollment/redemptions metadata for enterprise offer', async () => {
    EnterpriseDataApiService.fetchCourseEnrollments.mockResolvedValueOnce({ data: mockOfferEnrollmentsResponse });
    const budgetId = 'test-budget-id';
    const { result, waitForNextUpdate } = renderHook(() => useOfferRedemptions(
      TEST_ENTERPRISE_UUID,
      mockEnterpriseOffer.id,
      budgetId,
    ));

    expect(result.current).toMatchObject({
      offerRedemptions: {
        itemCount: 0,
        pageCount: 0,
        results: [],
      },
      isLoading: true,
      fetchOfferRedemptions: expect.any(Function),
    });
    act(() => {
      result.current.fetchOfferRedemptions({
        pageIndex: 0, // `DataTable` uses zero-based indexing
        pageSize: 20,
        sortBy: [
          { id: 'enrollmentDate', desc: true },
        ],
        filters: [
          { id: 'Enrollment Details', value: mockOfferEnrollments[0].user_email },
        ],
      });
    });

    await waitForNextUpdate();

    const expectedApiOptions = {
      page: 1,
      pageSize: 20,
      offerId: mockEnterpriseOffer.id,
      ordering: '-enrollment_date', // default sort order
      searchAll: mockOfferEnrollments[0].user_email,
      ignoreNullCourseListPrice: true,
      budgetId,
    };
    expect(EnterpriseDataApiService.fetchCourseEnrollments).toHaveBeenCalledWith(
      TEST_ENTERPRISE_UUID,
      expectedApiOptions,
    );
    expect(result.current).toMatchObject({
      offerRedemptions: {
        itemCount: 100,
        pageCount: 5,
        results: camelCaseObject(mockOfferEnrollments),
      },
      isLoading: false,
      fetchOfferRedemptions: expect.any(Function),
    });

    expect(expectedApiOptions.budgetId).toBe(budgetId);
  });
});

import { renderHook } from '@testing-library/react-hooks/dom';
import { waitFor, act } from '@testing-library/react';

import DiscoveryApiService from '../../../../data/services/DiscoveryApiService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import {
  useSubsidyRequests,
  useCourseDetails,
} from '../hooks';
import { SUBSIDY_REQUEST_STATUS, SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';

const TEST_LICENSE_REQUEST = {
  uuid: 'test-license-request-uuid',
};
const TEST_COUPON_CODE_REQUEST_1 = {
  uuid: 'test-coupon-code-request-uuid',
};
const TEST_COUPON_CODE_REQUEST_2 = {
  uuid: 'test-coupon-code-request-2-uuid',
};

jest.mock('../../../../data/services/DiscoveryApiService');
jest.mock('../../../../data/services/EnterpriseAccessApiService');

describe('useSubsidyRequests', () => {
  afterEach(() => jest.clearAllMocks());

  describe('handleFetchRequests', () => {
    it('should fetch overview and requests for licenses', async () => {
      EnterpriseAccessApiService.getLicenseRequestOverview.mockResolvedValue({
        data: [{
          state: SUBSIDY_REQUEST_STATUS.REQUESTED,
          count: 1,
        }],
      });
      EnterpriseAccessApiService.getLicenseRequests.mockResolvedValue({
        data: {
          results: [TEST_LICENSE_REQUEST],
          numPages: 1,
          count: 1,
        },
      });
      const { result } = renderHook(() => useSubsidyRequests(
        TEST_ENTERPRISE_UUID,
        SUPPORTED_SUBSIDY_TYPES.license,
      ));

      const { handleFetchRequests } = result.current;

      handleFetchRequests({
        filters: [],
        pageIndex: 0,
      });

      await waitFor(() => {
        expect(EnterpriseAccessApiService.getLicenseRequestOverview).toHaveBeenCalled();
        expect(EnterpriseAccessApiService.getLicenseRequests).toHaveBeenCalled();
      });

      const { requests, requestsOverview } = result.current;
      expect(requestsOverview.find(overview => overview.value === SUBSIDY_REQUEST_STATUS.REQUESTED).number).toEqual(1);
      expect(requests.requests[0]).toEqual({ ...TEST_LICENSE_REQUEST });
    });

    it('should fetch overview and requests for coupons', async () => {
      EnterpriseAccessApiService.getCouponCodeRequestOverview.mockResolvedValue({
        data: [{
          state: SUBSIDY_REQUEST_STATUS.APPROVED,
          count: 2,
        }],
      });
      EnterpriseAccessApiService.getCouponCodeRequests.mockResolvedValue({
        data: {
          results: [TEST_COUPON_CODE_REQUEST_1, TEST_COUPON_CODE_REQUEST_2],
          numPages: 1,
          count: 2,
        },
      });
      const { result } = renderHook(() => useSubsidyRequests(
        TEST_ENTERPRISE_UUID,
        SUPPORTED_SUBSIDY_TYPES.coupon,
      ));

      const { handleFetchRequests } = result.current;

      handleFetchRequests({
        filters: [],
        pageIndex: 0,
      });

      await waitFor(() => {
        expect(EnterpriseAccessApiService.getCouponCodeRequestOverview).toHaveBeenCalled();
        expect(EnterpriseAccessApiService.getCouponCodeRequests).toHaveBeenCalled();
      });

      const { requests, requestsOverview } = result.current;
      expect(requestsOverview.find(overview => overview.value === SUBSIDY_REQUEST_STATUS.APPROVED).number).toEqual(2);
      expect(requests.requests[0]).toEqual(TEST_COUPON_CODE_REQUEST_1);
      expect(requests.requests[1]).toEqual(TEST_COUPON_CODE_REQUEST_2);
    });
  });

  describe('updateRequestStatus', () => {
    it('should update request status', async () => {
      const mockCouponCodeRequests = [{
        state: 'requested',
        ...TEST_COUPON_CODE_REQUEST_1,
      }, {
        ...TEST_COUPON_CODE_REQUEST_2,
        state: 'requested',
      }];

      EnterpriseAccessApiService.getCouponCodeRequestOverview.mockResolvedValue({
        data: [{
          state: SUBSIDY_REQUEST_STATUS.REQUESTED,
          count: 2,
        }],
      });
      EnterpriseAccessApiService.getCouponCodeRequests.mockResolvedValue({
        data: {
          results: mockCouponCodeRequests,
          numPages: 1,
          count: 2,
        },
      });
      const { result } = renderHook(() => useSubsidyRequests(
        TEST_ENTERPRISE_UUID,
        SUPPORTED_SUBSIDY_TYPES.coupon,
      ));

      const { handleFetchRequests } = result.current;

      handleFetchRequests({
        filters: [],
        pageIndex: 0,
      });

      await waitFor(() => {
        expect(EnterpriseAccessApiService.getCouponCodeRequestOverview).toHaveBeenCalled();
        expect(EnterpriseAccessApiService.getCouponCodeRequests).toHaveBeenCalled();
      });

      const { requests, requestsOverview, updateRequestStatus } = result.current;

      await waitFor(() => {
        expect(requests.requests[0].uuid).toEqual(TEST_COUPON_CODE_REQUEST_1.uuid);
        expect(requests.requests[0].requestStatus).toEqual(SUBSIDY_REQUEST_STATUS.REQUESTED);
        expect(requestsOverview.find(
          overview => overview.value === SUBSIDY_REQUEST_STATUS.REQUESTED,
        ).number).toEqual(2);
        expect(requestsOverview.find(
          overview => overview.value === SUBSIDY_REQUEST_STATUS.APPROVED,
        ).number).toEqual(0);
      });

      act(() => updateRequestStatus({
        request: { ...mockCouponCodeRequests[0], requestStatus: SUBSIDY_REQUEST_STATUS.REQUESTED },
        newStatus: SUBSIDY_REQUEST_STATUS.APPROVED,
      }));

      await waitFor(() => {
        expect(result.current.requests.requests[0].requestStatus).toEqual(SUBSIDY_REQUEST_STATUS.APPROVED);
        expect(result.current.requestsOverview.find(
          overview => overview.value === SUBSIDY_REQUEST_STATUS.REQUESTED,
        ).number).toEqual(1);
        expect(result.current.requestsOverview.find(
          overview => overview.value === SUBSIDY_REQUEST_STATUS.APPROVED,
        ).number).toEqual(1);
      });
    });
  });
});

describe('useCourseDetails', () => {
  const mockCourseKey = 'edx+101';

  it('should fetch course details from discovery api', async () => {
    const mockCourseDetails = {
      shortDescription: 'The 101s',
    };
    DiscoveryApiService.fetchCourseDetails.mockResolvedValue({
      data: mockCourseDetails,
    });
    const { result, waitForNextUpdate } = renderHook(() => useCourseDetails(mockCourseKey));
    await waitForNextUpdate();
    expect(DiscoveryApiService.fetchCourseDetails).toHaveBeenCalled();
    expect(result.current[0]).toEqual(mockCourseDetails);
  });
});

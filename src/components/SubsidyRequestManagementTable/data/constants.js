import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../data/constants/subsidyRequests';

export const DEBOUNCE_TIME_MS = 200;

export const PAGE_SIZE = 20;

export const SUBSIDY_REQUESTS_TYPES = {
  [SUPPORTED_SUBSIDY_TYPES.coupon]: {
    overview: EnterpriseAccessApiService.getCouponCodeRequestOverview,
    requests: EnterpriseAccessApiService.getCouponCodeRequests,
  },
  [SUPPORTED_SUBSIDY_TYPES.license]: {
    overview: EnterpriseAccessApiService.getLicenseRequestOverview,
    requests: EnterpriseAccessApiService.getLicenseRequests,
  },
};

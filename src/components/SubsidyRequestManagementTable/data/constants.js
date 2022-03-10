import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';

export const DEBOUNCE_TIME_MS = 200;

export const PAGE_SIZE = 20;

export const SUPPORTED_SUBSIDY_TYPES = {
  codes: 'codes',
  licenses: 'licenses',
};

export const SUBSIDY_REQUESTS_TYPES = {
  [SUPPORTED_SUBSIDY_TYPES.codes]: {
    overview: EnterpriseAccessApiService.getCouponCodeRequestOverview,
    requests: EnterpriseAccessApiService.getCouponCodeRequests,
  },
  [SUPPORTED_SUBSIDY_TYPES.licenses]: {
    overview: EnterpriseAccessApiService.getLicenseRequestOverview,
    requests: EnterpriseAccessApiService.getLicenseRequests,
  },
};

export const SUBSIDY_REQUEST_STATUS = {
  REQUESTED: 'requested',
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  ERROR: 'error',
};

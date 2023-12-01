export const mockEnterpriseOfferId = '123';
export const mockSubsidyAccessPolicyUUID = 'c17de32e-b80b-468f-b994-85e68fd32751';

export const mockAssignableSubsidyAccessPolicy = {
  uuid: mockSubsidyAccessPolicyUUID,
  subsidyActiveDatetime: '2023-11-01T13:06:46Z',
  subsidyExpirationDatetime: '2024-02-29T13:06:59Z',
  policyType: 'AssignedLearnerCreditAccessPolicy',
  displayName: 'Assignable Learner Credit',
  spendLimit: 10000 * 100,
  assignmentConfiguration: {
    uuid: 'test-uuid',
  },
  aggregates: {
    spendAvailableUsd: 10000,
    amountAllocatedUsd: 100,
    amountRedeemedUsd: 350,
  },
  isAssignable: true,
  subsidyUuid: 'mock-subsidy-uuid',
};

export const mockAssignableSubsidyAccessPolicyWithNoUtilization = {
  uuid: mockSubsidyAccessPolicyUUID,
  subsidyActiveDatetime: '2023-11-01T13:06:46Z',
  subsidyExpirationDatetime: '2024-02-29T13:06:59Z',
  policyType: 'AssignedLearnerCreditAccessPolicy',
  displayName: 'Assignable Learner Credit',
  spendLimit: 10000 * 100,
  assignmentConfiguration: {
    uuid: 'test-uuid',
  },
  aggregates: {
    spendAvailableUsd: 10000,
    amountAllocatedUsd: 0,
    amountRedeemedUsd: 0,
  },
  isAssignable: true,
  subsidyUuid: 'mock-subsidy-uuid',
};

export const mockAssignableSubsidyAccessPolicyWithSpendNoAllocations = {
  uuid: mockSubsidyAccessPolicyUUID,
  subsidyActiveDatetime: '2023-11-01T13:06:46Z',
  subsidyExpirationDatetime: '2024-02-29T13:06:59Z',
  policyType: 'AssignedLearnerCreditAccessPolicy',
  displayName: 'Assignable Learner Credit',
  spendLimit: 10000 * 100,
  assignmentConfiguration: {
    uuid: 'test-uuid',
  },
  aggregates: {
    spendAvailableUsd: 10000,
    amountAllocatedUsd: 0,
    amountRedeemedUsd: 5000,
  },
  isAssignable: true,
  subsidyUuid: 'mock-subsidy-uuid',
};

export const mockAssignableSubsidyAccessPolicyWithSpendNoRedeemed = {
  uuid: mockSubsidyAccessPolicyUUID,
  subsidyActiveDatetime: '2023-11-01T13:06:46Z',
  subsidyExpirationDatetime: '2024-02-29T13:06:59Z',
  policyType: 'AssignedLearnerCreditAccessPolicy',
  displayName: 'Assignable Learner Credit',
  spendLimit: 10000 * 100,
  assignmentConfiguration: {
    uuid: 'test-uuid',
  },
  aggregates: {
    spendAvailableUsd: 10000,
    amountAllocatedUsd: 0,
    amountRedeemedUsd: 5000,
  },
  isAssignable: true,
  subsidyUuid: 'mock-subsidy-uuid',
};

export const mockPerLearnerSpendLimitSubsidyAccessPolicy = {
  uuid: mockSubsidyAccessPolicyUUID,
  subsidyActiveDatetime: '2023-11-01T13:06:46Z',
  subsidyExpirationDatetime: '2024-02-29T13:06:59Z',
  policyType: 'PerLearnerSpendCreditAccessPolicy',
  displayName: 'Per Learner Spend Limit',
  spendLimit: 10000 * 100,
  aggregates: {
    spendAvailableUsd: 10000,
    amountAllocatedUsd: 100,
    amountRedeemedUsd: 350,
  },
  isAssignable: false,
  subsidyUuid: 'mock-subsidy-uuid',
};

export const mockSubsidySummary = {
  offerId: '84014',
  budgets: [],
  enterpriseCustomerUuid: '852eac48-b5a9-4849-8490-743f3f2deabf',
  enterpriseName: 'Executive Education (2U) Integration QA',
  sumAmountLearnerPaid: 0.0,
  sumCoursePrice: 0.0,
  status: 'Open',
  offerType: 'Site',
  dateCreated: '2022-09-23T12:37:32Z',
  emailsForUsageAlert: '',
  discountType: 'percent_discount',
  discountValue: 100.0,
  maxDiscount: 50000.0,
  totalDiscountEcommerce: 42024.0,
  amountOfOfferSpent: 0.0,
  percentOfOfferSpent: 0.0,
  remainingBalance: 50000.0,
  amountOfferSpentOcm: 0.0,
  amountOfferSpentExecEd: 0.0,
  exportTimestamp: '2023-12-04T06:47:54Z',
};

export const mockEnterpriseOfferMetadata = {
  id: 99511,
  startDatetime: '2022-09-01T00:00:00Z',
  endDatetime: '2024-09-01T00:00:00Z',
  displayName: 'Test enterprise',
};

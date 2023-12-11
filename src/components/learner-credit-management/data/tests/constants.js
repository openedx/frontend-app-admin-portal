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
  budgetsSummary: [],
  offerId: '1234',
  offerType: 'Site',
  percentUtilized: 0.5,
  redeemedFunds: 500,
  remainingFunds: 500,
  totalFunds: 1000,
};

export const mockEnterpriseOfferMetadata = {
  id: 99511,
  startDatetime: '2022-09-01T00:00:00Z',
  endDatetime: '2024-09-01T00:00:00Z',
  displayName: 'Test Display Name',
};

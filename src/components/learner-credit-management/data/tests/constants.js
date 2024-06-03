const today = Date.now();

export const mockEnterpriseOfferId = '123';

export const mockSubsidyAccessPolicyUUID = 'c17de32e-b80b-468f-b994-85e68fd32751';
export const mockGroupUuid = '81d68e18-2ce0-4080-8141-36679bdaef33';

export const mockAssignableSubsidyAccessPolicy = {
  uuid: mockSubsidyAccessPolicyUUID,
  subsidyActiveDatetime: new Date(today).toISOString(),
  subsidyExpirationDatetime: new Date(today + 130 * 24 * 60 * 60 * 1000).toISOString(),
  groupAssociations: [mockGroupUuid],
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
  subsidyActiveDatetime: new Date(today).toISOString(),
  subsidyExpirationDatetime: new Date(today + 130 * 24 * 60 * 60 * 1000).toISOString(),
  groupAssociations: [],
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
  subsidyActiveDatetime: new Date(today).toISOString(),
  subsidyExpirationDatetime: new Date(today + 130 * 24 * 60 * 60 * 1000).toISOString(),
  groupAssociations: [],
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
  subsidyActiveDatetime: new Date(today).toISOString(),
  subsidyExpirationDatetime: new Date(today + 130 * 24 * 60 * 60 * 1000).toISOString(),
  groupAssociations: [],
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
  subsidyActiveDatetime: new Date(today).toISOString(),
  subsidyExpirationDatetime: new Date(today + 130 * 24 * 60 * 60 * 1000).toISOString(),
  groupAssociations: ['test-group-uuid'],
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

export const mockSpendLimitNoGroupsSubsidyAccessPolicy = {
  uuid: mockSubsidyAccessPolicyUUID,
  subsidyActiveDatetime: new Date(today).toISOString(),
  subsidyExpirationDatetime: new Date(today + 130 * 24 * 60 * 60 * 1000).toISOString(),
  groupAssociations: [],
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
  groupAssociations: ['test-group-uuid'],
};

export const mockEnterpriseOfferMetadata = {
  id: 99511,
  startDatetime: new Date(today).toISOString(),
  endDatetime: new Date(today + 130 * 24 * 60 * 60 * 1000).toISOString(),
  displayName: 'Test Display Name',
};

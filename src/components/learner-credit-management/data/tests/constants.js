export const mockEnterpriseOfferId = '123';
export const mockSubsidyAccessPolicyUUID = 'c17de32e-b80b-468f-b994-85e68fd32751';

export const mockAssignableSubsidyAccessPolicy = {
  uuid: mockSubsidyAccessPolicyUUID,
  policyType: 'AssignedLearnerCreditAccessPolicy',
  assignmentConfiguration: {
    uuid: 'test-uuid',
  },
  displayName: 'Assignable Learner Credit',
  aggregates: {
    spendAvailableUsd: 10000,
  },
  isAssignable: true,
};

export const mockPerLearnerSpendLimitSubsidyAccessPolicy = {
  uuid: mockSubsidyAccessPolicyUUID,
  policyType: 'PerLearnerSpendCreditAccessPolicy',
  displayName: 'Per Learner Spend Limit',
  aggregates: {
    spendAvailableUsd: 10000,
  },
  isAssignable: false,
};

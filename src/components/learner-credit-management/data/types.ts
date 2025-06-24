export type SubsidyAccessPolicy = {
  uuid: string;
  displayName: string;
  isAssignable: boolean;
  policyType: string;
  assignmentConfiguration: Record<string, string>;
  catalogUuid: string;
  groupAssociations: string[];
  subsidyActiveDatetime: string;
  subsidyExpirationDatetime: string;
  retired: boolean;
  isRetiredOrExpired?: boolean;
  aggregates?: {
    spendAvailableUsd: number;
    amountRedeemedUsd: number;
    amountAllocatedUsd: number;
  };
};

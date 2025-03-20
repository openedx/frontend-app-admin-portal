export type SubsidyAccessPolicy = {
  uuid: string;
  displayName: string;
  isAssignable: boolean;
  policyType: string;
  assignmentConfiguration: Record<string, string>;
  catalogUuid: string;
  groupAssociations: string[];
};

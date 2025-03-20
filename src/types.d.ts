export type Paginated<ResultItem> = {
  next: string?,
  previous: string?,
  count: number,
  results: ResultItem[],
};

export type PaginatedCurrentPage<ResultItem> = Paginated<ResultItem> & {
  currentPage: number,
  start: number,
};

export type EnterpriseGroupType = 'budget' | 'flex';

export type EnterpriseGroup = {
  /* uuid of enterprise customer */
  enterpriseCustomer: string,
  /* Group name */
  name: string,
  /* Group uuid */
  uuid: string,
  /* Number of accepted Group members */
  acceptedMembersCount: number,
  /* Type of group */
  groupType: EnterpriseGroupType,
  /* Date group was created */
  created: string,
};

export type EnterpriseGroupMemberDetails = {
  userEmail: string,
  userName: string
};

export type EnterpriseGroupMembership = {
  enterpriseCustomerUserId: number,
  lmsUserId: number,
  pendingEnterpriseCustomerUserId: number | null,
  enterpriseGroupMembershipUuid: string,
  recentAction: string,
  /* TODO: enumerate status values */
  status: string,
  /* Date string */
  activatedAt: string,
  enrollments: number,
  groupName: string,
  groupUuid: string,
  memberDetails: EnterpriseGroupMemberDetails,
};

export type EnterpriseFeatures = {
  catalogQuerySearchFiltersEnabled?: boolean,
};

export as namespace Types;

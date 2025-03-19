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

export type EnterpriseCustomer = {
  /* not extensive list of properties */
  name: string,
  uuid: string,
  slug: string,
};

export type User = {
  id: number,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
  dateJoined: string,
  isStaff: boolean,
  isActive: boolean,
};

export type EnterpriseLearner = {
  /* not extensive list of properties */
  id: number,
  enterpriseCustomer: EnterpriseCustomer,
  userId: number,
  created: string,
  user: User,
  active: boolean,
};

export type EnterpriseFeatures = {
  catalogQuerySearchFiltersEnabled?: boolean,
};

export as namespace Types;

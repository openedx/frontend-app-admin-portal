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

export as namespace Types;

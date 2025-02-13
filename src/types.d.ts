export type Paginated<ResultItem> = {
  next: string?,
  previous: string?,
  count: number,
  current_page: number,
  start: number,
  results: ResultItem[],
};

export type EnterpriseGroupType = 'budget' | 'flex';

export type EnterpriseGroup = {
  /* uuid of enterprise customer */
  enterprise_customer: string,
  /* Group name */
  name: string,
  /* Group uuid */
  uuid: string,
  /* Number of accepted Group members */
  accepted_members_count: number,
  /* Type of group */
  group_type: EnterpriseGroupType,
  /* Date group was created */
  created: string,
};

export as namespace Types;

declare global {
  // Note: ideally defined upstream in @edx/frontend-platform
  type AuthenticatedUser = {
    userId: string;
    username: string;
    roles: string[];
    administrator: boolean;
    extendedProfile?: Record<string, any>;
  };

  // Note: ideally defined upstream in @edx/frontend-platform
  type AppContextValue = {
    authenticatedUser: AuthenticatedUser;
  };

  type Paginated<ResultItem> = {
    next: string?,
    previous: string?,
    count: number,
    results: ResultItem[],
  };

  type PaginatedCurrentPage<ResultItem> = Paginated<ResultItem> & {
    currentPage: number,
    start: number,
  };

  type EnterpriseGroupType = 'budget' | 'flex';

  type EnterpriseGroup = {
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

  type EnterpriseFeatures = {
    catalogQuerySearchFiltersEnabled?: boolean,
  };
}

export {};

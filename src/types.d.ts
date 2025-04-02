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
    /* Whether group applies to all contexts */
    appliesToAllContexts: boolean,
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
    status: string,
    activatedAt: string,
    enrollments: number,
    groupName: string,
    groupUuid: string,
    memberDetails: EnterpriseGroupMemberDetails,
  };

  type EnterpriseCustomer = {
    /* not extensive list of properties */
    name: string,
    uuid: string,
    slug: string,
  };

  type User = {
    id: number,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    dateJoined: string,
    isStaff: boolean,
    isActive: boolean,
  };

  type EnterpriseLearner = {
    /* not extensive list of properties */
    id: number,
    enterpriseCustomer: EnterpriseCustomer,
    userId: number,
    created: string,
    user: User,
    active: boolean,
  };

  type EnterpriseFeatures = {
    catalogQuerySearchFiltersEnabled?: boolean,
  };

  type SubscriptionPlan = {
    title: string,
    uuid: string,
    startDate: string,
    expirationDate: string,
    enterpriseCustomerUuid: string,
    enterpriseCatalogUuid: string,
    isActive: boolean,
    isCurrent: boolean,
    isRevocationCapEnabled: boolean,
    daysUntilExpiration: number,
    daysUntilExpirationIncludingRenewals: number,
    isLockedForRenewalProcessing: boolean,
    shouldAutoApplyLicenses: boolean,
    created: string,
    planType: string,
  };

  type LearnerProfileSubscriptionType = {
    uuid: string,
    status: string,
    userEmail: string,
    assignedDate: string,
    activationDate: string,
    revokedDate: string,
    lastRemindDate: string,
    subscriptionPlanTitle: string,
    subscriptionPlanExpirationDate: string,
    subscriptionPlan: SubscriptionPlan,
  };

  type LearnerProfileEnrollmentType = {
    id: number,
    created: string,
    modified: string,
    courseId: string,
    savedForLater: boolean,
    unenrolled: boolean,
    unenrolledAt: string,
    enterpriseCustomerUser: number,
    source: number,
    courseRunId: string,
    courseRunStatus: string,
    startDate: string,
    endDate: string,
    displayName: string,
    orgName: string,
    pacing: string,
    isRevoked: boolean,
    isEnrollmentActive: boolean,
    mode: string,
    courseKey: string,
    productSource: string,
    enrollBy: string,
  };

  type LearnerProfileGroupsType = {
    enterpriseCustomerUserId: number,
    lmsUserId: number,
    pendingEnterpriseCustomerUserId: string,
    memberDetails: {
      userEmail: string,
      userName: string,
    }
    recentAction: string,
    status: string,
    activatedAt: string,
    enrollments: number,
    groupName: string,
    groupUuid: string,
  };

  export type LearnerProfileType = {
    subscriptions: LearnerProfileSubscriptionType[],
    group_memberships: LearnerProfileGroupsType[],
    enrollments: {
      inProgress: LearnerProfileEnrollmentType[],
      upcoming: LearnerProfileEnrollmentType[],
      completed: LearnerProfileEnrollmentType[],
      savedForLater: LearnerProfileEnrollmentType[]
    },
  };

}

export {};

/* START LOCAL TESTING CONSTANTS */
// Set to false before pushing PR! otherwise set to true to enable local testing of learner-credit-management components
// Test will fail as additional check to ensure this is set to false before pushing PR
export const TEST_FLAG = false;
// Test enterpriseCatalogUuid for learner-credit-management search
// to display card selections and confirmation
export const testEnterpriseCatalogUuid = 'e3107bf4-2eac-4307-a049-cc691ea7213b ';
// function that passes through enterpriseCatalogUuid if TEST_FLAG is false, otherwise
// returns local testing enterpriseCatalogUuid
export const ENABLE_TESTING = (enterpriseCatalogUuid, enableTest = TEST_FLAG) => {
  if (enableTest) {
    return testEnterpriseCatalogUuid;
  }
  return enterpriseCatalogUuid;
};
/* END LOCAL TESTING CONSTANTS */

export const API_FIELDS_BY_TABLE_COLUMN_ACCESSOR = {
  courseTitle: 'course_title',
  enrollmentDate: 'enrollment_date',
  userEmail: 'user_email',
  courseListPrice: 'course_list_price',
};

// Course pace text
export const COURSE_PACING_MAP = {
  SELF_PACED: 'self_paced',
  INSTRUCTOR_PACED: 'instructor_paced',
};

// Percentage where messaging (e.g., Alert) on low remaining balance will begin appearing
export const LOW_REMAINING_BALANCE_PERCENT_THRESHOLD = 0.75;

// Dollar amount remaining where messaging (e.g., Alert) on no remaining balance will begin
// appearing, as learners may not be able to redeem learner credit once the organization's
// balance reaches this threshold.
export const NO_BALANCE_REMAINING_DOLLAR_THRESHOLD = 100;

export const DATE_FORMAT = 'MMMM DD, YYYY';

export const SHORT_MONTH_DATE_FORMAT = 'MMM D, YYYY';
export const DATETIME_FORMAT = 'MMM D, YYYY h:mma';

export const EXEC_ED_OFFER_TYPE = 'learner_credit';

// Budget Detail Page Tabs
export const BUDGET_DETAIL_ACTIVITY_TAB = 'activity';
export const BUDGET_DETAIL_CATALOG_TAB = 'catalog';
export const BUDGET_DETAIL_MEMBERS_TAB = 'members';
export const BUDGET_DETAIL_REQUESTS_TAB = 'requests';
export const BUDGET_DETAIL_TAB_LABELS = {
  [BUDGET_DETAIL_ACTIVITY_TAB]: 'Activity',
  [BUDGET_DETAIL_CATALOG_TAB]: 'Catalog',
  [BUDGET_DETAIL_MEMBERS_TAB]: 'Members',
  [BUDGET_DETAIL_REQUESTS_TAB]: 'Requests',
};

// TODO: i18n'tify this
// Card text for used in useCourseCardMetadata
export const CARD_TEXT = {
  BADGE: {
    course: 'Course',
    execEd: 'Executive Education',
  },
  BUTTON_ACTION: {
    viewCourse: 'View course',
    assign: 'Assign',
  },
  ENROLLMENT: {
    text: 'Learner must enroll by',
  },
  PRICE: {
    subText: 'Per learner price',
  },
};

// Facet filters
export const LEARNING_TYPE_REFINEMENT = 'learning_type';
export const LANGUAGE_REFINEMENT = 'language';

// Learning types
export const CONTENT_TYPE_COURSE = 'course';
export const EXEC_ED_TITLE = 'Executive Education';
export const EXEC_ED_COURSE_TYPE = 'executive-education-2u';

// Learner must enroll within 90 days of assignment
export const ASSIGNMENT_ENROLLMENT_DEADLINE = 90;

// Number of items to display per page in Budget Detail assignment/spend tables
export const PAGE_SIZE = 25;
export const DEFAULT_PAGE = 0; // `DataTable` uses zero-index array

// Number of items to display per page in Budget Catalog tab
export const SEARCH_RESULT_PAGE_SIZE = 15;

// Max width of Assigned table status column's modalpopup dialog; matches `Popover`.
export const ASSIGNMENT_STATUS_MODAL_MAX_WIDTH = 480;

export const MEMBERS_TABLE_PAGE_SIZE = 10;

// Enroll-by date warning message threshold by days
export const ENROLL_BY_DATE_DAYS_THRESHOLD = 10;

// Allocation assignment expiration dropoff threshold
export const DAYS_UNTIL_ASSIGNMENT_ALLOCATION_EXPIRATION = 90;

// When the start date is before this number of days before today, display the alternate start date (fixed to today).
export const START_DATE_DEFAULT_TO_TODAY_THRESHOLD_DAYS = 14;

// Default empty content_price value
export const EMPTY_CONTENT_PRICE_VALUE = 0;

// Late enrollments feature
export const LATE_ENROLLMENTS_BUFFER_DAYS = 30;

// Query Key factory for the learner credit management module, intended to be used with `@tanstack/react-query`.
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const learnerCreditManagementQueryKeys = {
  all: ['learner-credit-management'],
  budgets: (enterpriseId) => [...learnerCreditManagementQueryKeys.all, 'budgets', enterpriseId],
  budget: (budgetId) => [...learnerCreditManagementQueryKeys.all, 'budget', budgetId],
  // Used when fetching enterprise offer metadata when viewing the budget detail page for enterprise offer
  budgetEnterpriseOffer: (budgetId) => [...learnerCreditManagementQueryKeys.budget(budgetId), 'ecommerce'],
  budgetActivity: (budgetId) => [...learnerCreditManagementQueryKeys.budget(budgetId), 'activity'],
  budgetActivityOverview: (budgetId) => [...learnerCreditManagementQueryKeys.budgetActivity(budgetId), 'overview'],
  budgetGroupLearners: (budgetId) => [...learnerCreditManagementQueryKeys.budget(budgetId), 'group learners'],
  enterpriseCustomer: (enterpriseId) => [...learnerCreditManagementQueryKeys.all, 'enterpriseCustomer', enterpriseId],
  flexGroup: (enterpriseId) => [...learnerCreditManagementQueryKeys.enterpriseCustomer(enterpriseId), 'flexGroup'],
  group: (groupUuid) => [...learnerCreditManagementQueryKeys.all, 'group', groupUuid],
  catalog: (catalog) => [...learnerCreditManagementQueryKeys.all, 'catalog', catalog],
  catalogContainsContentItem: (catalogUuid, contentKey) => [
    ...learnerCreditManagementQueryKeys.catalog(catalogUuid),
    'containsContentItem',
    contentKey,
  ],
};

// Route to learner credit
export const LEARNER_CREDIT_ROUTE = '/:enterpriseSlug/admin/:enterpriseAppPage/:budgetId/:activeTabKey?';

// [ENT-9359] Restricted runs/custom presentations.
// The `restriction_type` metadata key for course runs may have this value,
// indicating that the run is restricted.
export const ENTERPRISE_RESTRICTION_TYPE = 'custom-b2b-enterprise';

export const APPROVED_REQUEST_TYPE = 'approved';

// BNR (Browse & Request) subsidy request constants
export const BNR_REQUEST_PAGE_SIZE = 10;
export const REQUEST_TAB_VISIBLE_STATES = [
  'requested',
  'declined',
  'cancelled',
  'errored',
];

export const REQUEST_STATUS_FILTER_CHOICES = [
  {
    name: 'Requested',
    value: 'requested',
  },
  {
    name: 'Declined',
    value: 'declined',
  },
  {
    name: 'Cancelled',
    value: 'cancelled',
  },
];

export const REQUEST_RECENT_ACTIONS = {
  requested: 'requested',
  pending: 'pending',
  approved: 'approved',
  declined: 'declined',
  error: 'errored',
  accepted: 'accepted',
  cancelled: 'cancelled',
  expired: 'expired',
  reversed: 'reversed',
  reminded: 'reminded',
};

export const REQUEST_STATUSES = {
  requested: 'Requested',
  pending: 'Pending',
  approved: 'Waiting For Learner',
  declined: 'Declined',
  error: 'Errored',
  accepted: 'Redeemed By Learner',
  cancelled: 'Cancelled',
  expired: 'Expired',
  reversed: 'Refunded',
  reminded: 'Waiting For Learner',
};

export const REQUEST_ERROR_REASON = {
  failed_approval: 'Failed: Approval',
  failed_decline: 'Failed: Declined',
  failed_cancellation: 'Failed: Cancellation',
  failed_redemption: 'Failed: Redemption',
  failed_reversal: 'Failed: Reversal',
};

export const REQUEST_ERROR_STATES = {
  failed_approval: 'failed_approval',
  failed_decline: 'failed_decline',
  failed_cancellation: 'failed_cancellation',
  failed_redemption: 'failed_redemption',
  failed_reversal: 'failed_reversal',
};

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

// Percentage where messaging (e.g., Alert) on low remaining balance will begin appearing
export const LOW_REMAINING_BALANCE_PERCENT_THRESHOLD = 0.75;

// Dollar amount remaining where messaging (e.g., Alert) on no remaining balance will begin
// appearing, as learners may not be able to redeem learner credit once the organization's
// balance reaches this threshold.
export const NO_BALANCE_REMAINING_DOLLAR_THRESHOLD = 100;

export const DATE_FORMAT = 'MMMM DD, YYYY';

export const EXEC_ED_OFFER_TYPE = 'learner_credit';

// Budget Detail Page Tabs
export const BUDGET_DETAIL_ACTIVITY_TAB = 'activity';
export const BUDGET_DETAIL_CATALOG_TAB = 'catalog';
export const BUDGET_DETAIL_TAB_LABELS = {
  [BUDGET_DETAIL_ACTIVITY_TAB]: 'Activity',
  [BUDGET_DETAIL_CATALOG_TAB]: 'Catalog',
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

// Query Key factory for the learner credit management module, intended to be used with `@tanstack/react-query`.
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const learnerCreditManagementQueryKeys = {
  all: ['learner-credit-management'],
  budgets: () => [...learnerCreditManagementQueryKeys.all, 'budgets'],
  budget: (budgetId) => [...learnerCreditManagementQueryKeys.all, 'budget', budgetId],
  budgetActivity: (budgetId) => [...learnerCreditManagementQueryKeys.budget(budgetId), 'activity'],
  budgetActivityOverview: (budgetId) => [...learnerCreditManagementQueryKeys.budgetActivity(budgetId), 'overview'],
};

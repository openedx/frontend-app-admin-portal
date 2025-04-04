/* eslint quote-props: 0 */
export const MAX_LENGTH_GROUP_NAME = 60;

export const GROUP_TYPE_BUDGET = 'budget';
export const GROUP_TYPE_FLEX = 'flex';

export const GROUP_DROPDOWN_TEXT = 'Select group';

export const GROUP_MEMBERS_TABLE_PAGE_SIZE = 10;
export const GROUP_MEMBERS_TABLE_DEFAULT_PAGE = 0; // `DataTable` uses zero-index array

// Query Key factory for the people management module, intended to be used with `@tanstack/react-query`.
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const peopleManagementQueryKeys = {
  all: ['people-management'],
  courseEnrollments: ({ enterpriseUuid, lmsUserId }) => [...peopleManagementQueryKeys.all, 'courseEnrollments', enterpriseUuid, lmsUserId],
  group: (groupUuid) => [...peopleManagementQueryKeys.all, 'group', groupUuid],
  groupMemberships: ({ enterpriseUuid, lmsUserId }) => [...peopleManagementQueryKeys.all, 'groupMemberships', enterpriseUuid, lmsUserId],
  learners: (groupUuid) => [...peopleManagementQueryKeys.all, 'learners', groupUuid],
  members: (enterpriseUuid) => [...peopleManagementQueryKeys.all, 'members', enterpriseUuid],
  removeMember: (groupUuid) => [...peopleManagementQueryKeys.all, 'removeMember', groupUuid],
  learnerProfile: ({ enterpriseId, userId, userEmail }) => [...peopleManagementQueryKeys.all, 'learnerProfile', enterpriseId, userId, userEmail],
  learnerCreditPlans: ({ enterpriseId, lmsUserId }) => [...peopleManagementQueryKeys.all, 'learnerCreditPlans', enterpriseId, lmsUserId],
};

export const MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT = 15;

export const HELP_CENTER_URL = 'https://enterprise-support.edx.org/s/topic/0TORc000000GBQvOAO/admin-experience';

export const COURSE_TYPE_MAP = {
  'audit': 'Audit',
  'professional': 'Professional',
  'verified-audit': 'Verified Audit',
  'credit-verified-audit': 'Credit Verified Audit',
  'masters': 'Masters',
  'masters-verified-audit': 'Masters Verified Audit',
  'verified': 'Verified',
  'spoc-verified-audit': 'SPOC Verified Audit',
  'honor': 'Honor',
  'verified-honor': 'Verified Honor',
  'credit-verified-honor': 'Credit Verified Honor',
  'executive-education-2u': 'Executive Education',
};

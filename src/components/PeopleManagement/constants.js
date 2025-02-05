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
  group: (groupUuid) => [...peopleManagementQueryKeys.all, 'group', groupUuid],
  members: (enterpriseUuid) => [...peopleManagementQueryKeys.all, 'members', enterpriseUuid],
  removeMember: (groupUuid) => [...peopleManagementQueryKeys.all, 'removeMember', groupUuid],
};

export const MAX_INITIAL_LEARNER_EMAILS_DISPLAYED_COUNT = 15;

export const HELP_CENTER_URL = 'https://enterprise-support.edx.org/s/topic/0TORc000000GBQvOAO/admin-experience';

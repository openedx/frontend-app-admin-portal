export const MAX_LENGTH_GROUP_NAME = 60;

export const GROUP_TYPE_BUDGET = 'budget';
export const GROUP_TYPE_FLEX = 'flex';

// Query Key factory for the people management module, intended to be used with `@tanstack/react-query`.
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const peopleManagementQueryKeys = {
  all: ['people-management'],
  members: (enterpriseUuid) => [...peopleManagementQueryKeys.all, 'members', enterpriseUuid],
};

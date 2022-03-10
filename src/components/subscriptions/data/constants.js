export const PAGE_SIZE = 20;

// Subscription license statuses as defined on the backend
export const ACTIVATED = 'activated';
export const ASSIGNED = 'assigned';
export const REVOKED = 'revoked';
export const REVOCABLE_STATUSES = [ACTIVATED, ASSIGNED];

export const SUBSCRIPTIONS = 'Subscriptions';
export const SUBSCRIPTION_USERS = 'Subscription Users';
export const SUBSCRIPTION_USERS_OVERVIEW = 'Subscription Users Overview';

export const NETWORK_ERROR_MESSAGE = 'Error occurred while loading the data.';
export const DEFAULT_PAGE = 1;

// used to determine whether to show the revocation cap messaging in the license revoke modal
export const SHOW_REVOCATION_CAP_PERCENT = 80;

// Subscription expiration
// Days until expiration constants
export const SUBSCRIPTION_DAYS_REMAINING_MODERATE = 120;
export const SUBSCRIPTION_DAYS_REMAINING_SEVERE = 60;
export const SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL = 30;
export const SUBSCRIPTION_PLAN_RENEWAL_LOCK_PERIOD_HOURS = 12;

// Prefix for cookies that determine if the user has seen the modal for that range of expiration
export const SEEN_SUBSCRIPTION_EXPIRATION_MODAL_COOKIE_PREFIX = 'seen-expiration-modal-';

// Multiple subscription picker
export const DEFAULT_LEAD_TEXT = 'Invite your learners to access your course catalog and manage your subscription cohorts.';

// user status badge mapping, takes user status as key returns label and badge style defined by ux
export const USER_STATUS_BADGE_MAP = {
  [ACTIVATED]: { label: 'Active', variant: 'success' },
  [ASSIGNED]: { label: 'Pending', variant: 'warning' },
  [REVOKED]: { label: 'Revoked', variant: 'light' },
};

// Subscription statuses
export const ACTIVE = 'Active';
export const ENDED = 'Ended';
export const SCHEDULED = 'Scheduled';

export const SUBSCRIPTION_STATUS_BADGE_MAP = {
  [ACTIVE]: { variant: 'primary' },
  [SCHEDULED]: { variant: 'secondary' },
  [ENDED]: { variant: 'light' },
};

// Browse and request constants `BrowseAndRequestAlert`
export const BROWSE_AND_REQUEST_ALERT_COOKIE_PREFIX = 'dismissed-browse-and-request-alert';
export const BROWSE_AND_REQUEST_ALERT_TEXT = 'New! You can now allow all learners to browse'
+ ' your catalog and request enrollment to courses.';
export const REDIRECT_SETTINGS_BUTTON_TEXT = 'Go to settings';

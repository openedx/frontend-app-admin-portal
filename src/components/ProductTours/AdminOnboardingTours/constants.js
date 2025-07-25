// Track learner progress - LPR flow
export const TRACK_LEARNER_PROGRESS_TARGETS = {
  LEARNER_PROGRESS_SIDEBAR: 'learner-progress-sidebar',
  LPR_OVERVIEW: 'lpr-overview',
  AI_SUMMARY: 'ai-summary',
  FULL_PROGRESS_REPORT: 'full-progress-report',
  PROGRESS_REPORT: 'progress-report',
  FILTER: 'filter',
  CSV_DOWNLOAD: 'csv-download',
  MODULE_ACTIVITY: 'module-activity',
};

// Organize learners - People Management flow
export const ORGANIZE_LEARNER_TARGETS = {
  PEOPLE_MANAGEMENT_SIDEBAR: 'people-management-link',
  ORG_MEMBER_TABLE: 'org-member-table',
  MEMBER_VIEW_MORE: 'member-view-more',
  ORG_GROUPS: 'org-groups',
  ORG_GROUP_CARD: 'org-group-card',
  CREATE_GROUP_BUTTON: 'create-group-button',
  MEMBER_DETAIL_PAGE: 'member-detail-page',
};

// View enrollment insights - Analytics flow
export const ANALYTICS_INSIGHTS_TARGETS = {
  SIDEBAR: 'analytics-sidebar',
  DATE_RANGE: 'analytics-date-range',
  METRICS: 'analytics-metrics',
  ENROLLMENTS_ENGAGEMENTS_COMPLETIONS: 'analytics-enrollments-engagements-completions .nav-item:nth-child(-n+3)',
  LEADERBOARD: 'analytics-leaderboard',
  SKILLS: 'analytics-skills',
};

export const ADMINISTER_SUBSCRIPTIONS_TARGETS = {
  SIDEBAR: 'subscriptions-sidebar',
  SUBSCRIPTION_PLANS_LIST: 'subscription-plans-list',
  MANAGE_LEARNERS_BUTTON: 'manage-learners-button',
  SUBSCRIPTION_PLANS_DETAIL_PAGE: 'subscription-plans-detail-page',
  INVITE_LEARNERS_BUTTON: 'invite-learners-button',
  LICENSE_ALLOCATION_SECTION: 'license-allocation-section',
  LICENSE_ALLOCATION_FILTERS: 'license-allocation-filters',
  SUBSCRIPTIONS_NAVIGATION: 'subscription-navigation',
  MANAGE_REQUESTS: 'tabs-subscription-management-tab-manage-requests',
};

// targets that will trigger an index reset
export const RESET_TARGETS = [
  ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTION_PLANS_DETAIL_PAGE,
  ORGANIZE_LEARNER_TARGETS.GROUP_DETAIL_CARD,
];

export const CUSTOMIZE_REPORTS_SIDEBAR = 'customize-reports-sidebar';

export const ADMIN_TOUR_EVENT_NAMES = {
  ADMINISTER_SUBSCRIPTIONS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.administer-subscriptions.advance',
  ADMINISTER_SUBSCRIPTIONS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.administer-subscriptions.completed',
  ADMINISTER_SUBSCRIPTIONS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.administer-subscriptions.dismiss',
  CUSTOMIZE_REPORTS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.customize-reports.completed',
  CUSTOMIZE_REPORTS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.customize-reports.dismiss',
  ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.enrollment-insights.advance',
  ENROLLMENT_INSIGHTS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.enrollment-insights.completed',
  ENROLLMENT_INSIGHTS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.enrollment-insights.dismiss',
  LEARNER_PROGRESS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.advance',
  LEARNER_PROGRESS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.completed',
  LEARNER_PROGRESS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.dismiss',
  ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.advance',
  ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.completed',
  ORGANIZE_LEARNERS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.dismiss',
  SET_UP_PREFERENCES_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.set-up-preferences.completed',
  SET_UP_PREFERENCES_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.set-up-preferences.dismiss',
};

export const ONBOARDING_WELCOME_MODAL_COOKIE_NAME = 'seen-onboarding-welcome-modal';
export const ONBOARDING_TOUR_DISMISS_COOKIE_NAME = 'dismiss-admin-onboarding-tour';

// Query Key factory for the people management module, intended to be used with `@tanstack/react-query`.
// Inspired by https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories.
export const adminOnboardingQueryKeys = {
  all: ['admin-onboarding'],
  fetchCompletedOnboardingFlows: ({ adminUuid }) => [...adminOnboardingQueryKeys.all, 'fetchCompletedOnboardingFlows', adminUuid],
  hydrateAdminOnboardingData: ({ enterpriseId }) => [...adminOnboardingQueryKeys.all, 'hydrateAdminOnboardingData', enterpriseId],
};

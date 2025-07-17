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
  ORG_GROUPS_ZERO_STATE: 'org-groups-zero-state',
  CREATE_GROUP_BUTTON: 'create-group-button',
  ORG_MEMBER_TABLE: 'org-member-table',
  ORG_MEMBER_HIGHLIGHT: 'org-member-highlight',
  MEMBER_VIEW_MORE: 'member-view-more',
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
};

// targets that will trigger an index reset
export const RESET_TARGETS = [
  ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTION_PLANS_DETAIL_PAGE,
];

export const CUSTOMIZE_REPORTS_SIDEBAR = 'customize-reports-sidebar';

export const ADMIN_TOUR_EVENT_NAMES = {
  ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.enrollment-insights.advance',
  ENROLLMENT_INSIGHTS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.enrollment-insights.completed',
  ENROLLMENT_INSIGHTS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.enrollment-insights.dismiss',
  LEARNER_PROGRESS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.advance',
  LEARNER_PROGRESS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.completed',
  LEARNER_PROGRESS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.dismiss',
  ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.advance',
  ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.completed',
  ORGANIZE_LEARNERS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.dismiss',
  ADMINISTER_SUBSCRIPTIONS_ADVANCE_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.administer-subscriptions.advance',
  ADMINISTER_SUBSCRIPTIONS_COMPLETED_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.administer-subscriptions.completed',
  ADMINISTER_SUBSCRIPTIONS_DISMISS_EVENT_NAME: 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.administer-subscriptions.dismiss',
};

export const ONBOARDING_WELCOME_MODAL_COOKIE_NAME = 'seen-onboarding-welcome-modal';
export const ONBOARDING_TOUR_DISMISS_COOKIE_NAME = 'dismiss-admin-onboarding-tour';

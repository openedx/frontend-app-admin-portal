// ADMIN TOUR TARGETS

// Track learner progress - LPR flow
const LEARNER_PROGRESS_SIDEBAR = 'learner-progress-sidebar';
const LPR_OVERVIEW = 'lpr-overview';
const AI_SUMMARY = 'ai-summary';
const PROGRESS_REPORT = 'progress-report';
const FULL_PROGRESS_REPORT = 'full-progress-report';
const FILTER = 'filter';
const CSV_DOWNLOAD = 'csv-download';
const MODULE_ACTIVITY = 'module-activity';
export const ANALYTICS_INSIGHTS_FLOW = {
  SIDEBAR: 'analytics-sidebar',
  DATE_RANGE: 'analytics-date-range',
  METRICS: 'analytics-metrics',
  ENROLLMENTS_ENGAGEMENTS_COMPLETIONS: 'analytics-enrollments-engagements-completions .nav-item:nth-child(-n+3)',
  LEADERBOARD: 'analytics-leaderboard',
  SKILLS: 'analytics-skills',
};

export const TRACK_LEARNER_PROGRESS_TARGETS = {
  LEARNER_PROGRESS_SIDEBAR,
  LPR_OVERVIEW,
  AI_SUMMARY,
  FULL_PROGRESS_REPORT,
  PROGRESS_REPORT,
  FILTER,
  CSV_DOWNLOAD,
  MODULE_ACTIVITY,
};

const LEARNER_PROGRESS_ADVANCE_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.advance';
const LEARNER_PROGRESS_DISMISS_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.dismiss';

export const ADMIN_TOUR_EVENT_NAMES = {
  LEARNER_PROGRESS_ADVANCE_EVENT_NAME,
  LEARNER_PROGRESS_DISMISS_EVENT_NAME,
};

export const ONBOARDING_WELCOME_MODAL_COOKIE_NAME = 'seen-onboarding-welcome-modal';
export const ONBOARDING_TOUR_DISMISS_COOKIE_NAME = 'dismiss-admin-onboarding-tour';

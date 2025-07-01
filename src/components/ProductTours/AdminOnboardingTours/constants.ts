import { ReactNode } from 'react';

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

// Organize learners - People Management flow
const ORGANIZE_LEARNERS_SIDEBAR = 'organize-learners-sidebar';
const ORG_GROUPS_ZERO_STATE = 'org-groups-zero-state';
const CREATE_GROUP_BUTTON = 'create-group-button';
const ORG_MEMBER_TABLE = 'org-member-table';
const ORG_MEMBER_HIGHLIGHT = 'org-member-highlight';
const MEMBER_VIEW_MORE = 'member-view-more';
const MEMBER_DETAIL_PAGE = 'member-detail-page';

export const ORGANIZE_LEARNER_TARGETS = {
  ORGANIZE_LEARNERS_SIDEBAR,
  ORG_GROUPS_ZERO_STATE,
  CREATE_GROUP_BUTTON,
  ORG_MEMBER_TABLE,
  ORG_MEMBER_HIGHLIGHT,
  MEMBER_VIEW_MORE,
  MEMBER_DETAIL_PAGE,
};

const LEARNER_PROGRESS_ADVANCE_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.advance';
const LEARNER_PROGRESS_COMPLETED_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.completed';
const LEARNER_PROGRESS_DISMISS_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.learner-progress.dismiss';
const ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.advance';
const ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.completed';
const ORGANIZE_LEARNERS_DISMISS_EVENT_NAME = 'edx.ui.enterprise.admin-portal.admin-onboarding-tours.organize-learners.dismiss';

export const ADMIN_TOUR_EVENT_NAMES = {
  LEARNER_PROGRESS_ADVANCE_EVENT_NAME,
  LEARNER_PROGRESS_COMPLETED_EVENT_NAME,
  LEARNER_PROGRESS_DISMISS_EVENT_NAME,
  ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME,
  ORGANIZE_LEARNERS_COMPLETED_EVENT_NAME,
  ORGANIZE_LEARNERS_DISMISS_EVENT_NAME,
};

export const ONBOARDING_WELCOME_MODAL_COOKIE_NAME = 'seen-onboarding-welcome-modal';
export const ONBOARDING_TOUR_DISMISS_COOKIE_NAME = 'dismiss-admin-onboarding-tour';

export interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title?: ReactNode;
  body: ReactNode;
  onAdvance: () => void;
}

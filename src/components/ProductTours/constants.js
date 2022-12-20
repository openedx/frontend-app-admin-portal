// Tour Targets
const SETTINGS_SIDEBAR = 'settings-sidebar-link';
const LEARNER_CREDIT = 'learner-credit-link';
const CONTENT_HIGHLIGHTS = 'highlights-link';

export const TOUR_TARGETS = {
  SETTINGS_SIDEBAR,
  LEARNER_CREDIT,
  CONTENT_HIGHLIGHTS,
};

export const PORTAL_APPEARANCE_TOUR_COOKIE_NAME = 'dismissed-portal-appearance-tour';
export const BROWSE_AND_REQUEST_TOUR_COOKIE_NAME = 'dismissed-browse-and-request-tour';
export const LEARNER_CREDIT_COOKIE_NAME = 'dismissed-learner-credit-tour';
export const HIGHLIGHTS_COOKIE_NAME = 'dismissed-highlights-tour';
export const COOKIE_NAMES = {
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
};

export const PORTAL_APPEARANCE_ADVANCE_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.portal-appearance.advanced';
export const PORTAL_APPEARANCE_DISMISS_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.portal-appearance.dismissed';
export const PORTAL_APPEARANCE_ON_END_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.portal-appearance.navigated-to-page';

export const LEARNER_CREDIT_ADVANCE_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.learner-credit.advanced';
export const LEARNER_CREDIT_DISMISS_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.learner-credit.dismissed';
export const LEARNER_CREDIT_ON_END_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.learner-credit.navigated-to-page';

export const HIGHLIGHTS_ADVANCE_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.highlights.advanced';
export const HIGHLIGHTS_DISMISS_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.highlights.dismissed';
export const HIGHLIGHTS_ON_END_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.highlights.navigated-to-page';

export const BROWSE_AND_REQUEST_ADVANCE_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.browse-and-request.advanced';
export const BROWSE_AND_REQUEST_DISMISS_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.browse-and-request.dismissed';
export const BROWSE_AND_REQUEST_ON_END_EVENT_NAME = 'edx.ui.enterprise.admin-portal.tours.browse-and-request.navigated-to-page';

export default {
  TOUR_TARGETS,
};

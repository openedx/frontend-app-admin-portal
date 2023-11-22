/**
 * @file Documents event tracking name space
 *
 * Event names should fallow the convention of:
 * <project name>.<product name>.<location>.<action>
 *
 * @example edx.ui.admin_portal. (project) subscriptions. (product) table. (location) clicked (action)
 * edx.ui.admin_portal.subscriptions.table.clicked
 */

/**
 * @constant PROJECT_NAME leading project identifier for event names
 */
const PROJECT_NAME = 'edx.ui.enterprise.admin_portal';

const SUBSCRIPTION_PREFIX = `${PROJECT_NAME}.subscriptions`;
const SETTINGS_PREFIX = `${PROJECT_NAME}.settings`;
const CONTENT_HIGHLIGHTS_PREFIX = `${PROJECT_NAME}.content_highlights`;
const LEARNER_CREDIT_MANAGEMENT_PREFIX = `${PROJECT_NAME}.learner_credit_management`;

const SUBSCRIPTION_TABLE_PREFIX = `${SUBSCRIPTION_PREFIX}.table`;
const CONTENT_HIGHLIGHT_STEPPER_BASE_PREFIX = `${CONTENT_HIGHLIGHTS_PREFIX}.stepper`;
const CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX = `${CONTENT_HIGHLIGHT_STEPPER_BASE_PREFIX}_step`;
const CONTENT_HIGHLIGHTS_DASHBOARD_PREFIX = `${CONTENT_HIGHLIGHTS_PREFIX}.dashboard`;
const CONTENT_HIGHLIGHTS_DELETE_CONTENT_PREFIX = `${CONTENT_HIGHLIGHTS_PREFIX}.delete_content_highlight`;

export const SUBSCRIPTION_TABLE_EVENTS = {
  // Pagination
  PAGINATION_NEXT: `${SUBSCRIPTION_TABLE_PREFIX}.pagination.next.clicked`,
  PAGINATION_PREVIOUS: `${SUBSCRIPTION_TABLE_PREFIX}.pagination.previous.clicked`,
  // Filter Actions
  FILTER_STATUS: `${SUBSCRIPTION_TABLE_PREFIX}.filter.status.changed`,
  FILTER_EMAIL: `${SUBSCRIPTION_TABLE_PREFIX}.filter.email.changed`,
  // Row Actions
  REMIND_ROW_CLICK: `${SUBSCRIPTION_TABLE_PREFIX}.remind.row.clicked`,
  REMIND_ROW_SUBMIT: `${SUBSCRIPTION_TABLE_PREFIX}.remind.row.submitted`,
  REMIND_ROW_CANCEL: `${SUBSCRIPTION_TABLE_PREFIX}.remind.row.canceled`,
  REVOKE_ROW_CLICK: `${SUBSCRIPTION_TABLE_PREFIX}.revoke.row.clicked`,
  REVOKE_ROW_SUBMIT: `${SUBSCRIPTION_TABLE_PREFIX}.revoke.row.submitted`,
  REVOKE_ROW_CANCEL: `${SUBSCRIPTION_TABLE_PREFIX}.revoke.row.canceled`,
  // Bulk Actions
  REMIND_BULK_CLICK: `${SUBSCRIPTION_TABLE_PREFIX}.remind.bulk.clicked`,
  REMIND_BULK_SUBMIT: `${SUBSCRIPTION_TABLE_PREFIX}.remind.bulk.submitted`,
  REMIND_BULK_CANCEL: `${SUBSCRIPTION_TABLE_PREFIX}.remind.bulk.canceled`,
  REVOKE_BULK_CLICK: `${SUBSCRIPTION_TABLE_PREFIX}.revoke.bulk.clicked`,
  REVOKE_BULK_SUBMIT: `${SUBSCRIPTION_TABLE_PREFIX}.revoke.bulk.submitted`,
  REVOKE_BULK_CANCEL: `${SUBSCRIPTION_TABLE_PREFIX}.revoke.bulk.canceled`,
  ENROLL_BULK_CLICK: `${SUBSCRIPTION_TABLE_PREFIX}.enroll.bulk.clicked`,
  ENROLL_BULK_SUBMIT: `${SUBSCRIPTION_TABLE_PREFIX}.enroll.bulk.submitted`,
  ENROLL_BULK_CANCEL: `${SUBSCRIPTION_TABLE_PREFIX}.enroll.bulk.canceled`,
  ENROLL_BULK_WARNING_MODAL_CONTINUE: `${SUBSCRIPTION_TABLE_PREFIX}.enroll.bulk.warning-modal.continued`,
  ENROLL_BULK_WARNING_MODAL_CANCEL: `${SUBSCRIPTION_TABLE_PREFIX}.enroll.bulk.warning-modal.canceled`,
};

// Content Highlights, will eventually need to be refactored using same pattern as subscriptions
export const CONTENT_HIGHLIGHTS_EVENTS = {
  // Deletion
  DELETE_HIGHLIGHT_MODAL: `${CONTENT_HIGHLIGHTS_DELETE_CONTENT_PREFIX}`,
  // Stepper Actions
  STEPPER_HYPERLINK_CLICK: `${CONTENT_HIGHLIGHT_STEPPER_BASE_PREFIX}.help_center_program_optimization_hyperlink.clicked`,
  STEPPER_CLOSE_HIGHLIGHT_MODAL: `${CONTENT_HIGHLIGHT_STEPPER_BASE_PREFIX}.close_stepper_modal.clicked`,
  STEPPER_CLOSE_HIGHLIGHT_MODAL_CANCEL: `${CONTENT_HIGHLIGHT_STEPPER_BASE_PREFIX}.close_stepper_modal.cancel.clicked`,
  STEPPER_CLOSE_STEPPER_INCOMPLETE: `${CONTENT_HIGHLIGHT_STEPPER_BASE_PREFIX}.close_without_saving.clicked`,
  STEPPER_SELECT_CONTENT_ABOUT_PAGE: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.select_content_about_page.clicked`,
  STEPPER_CONFIRM_CONTENT_ABOUT_PAGE: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.confirm_content_about_page.clicked`,
  STEPPER_STEP_CREATE_TITLE_NEXT: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.create_title.next.clicked`,
  STEPPER_STEP_SELECT_CONTENT_NEXT: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.select_content.next.clicked`,
  STEPPER_STEP_SELECT_CONTENT_BACK: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.select_content.back.clicked`,
  STEPPER_STEP_CONFIRM_CONTENT_BACK: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.confirm_content.back.clicked`,
  STEPPER_STEP_CONFIRM_CONTENT_DELETE: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.confirm_content.content_delete.clicked`,
  STEPPER_STEP_CONFIRM_CONTENT_PUBLISH: `${CONTENT_HIGHLIGHTS_STEPPER_STEP_PREFIX}.confirm_content.publish_button.clicked`,
  // Dashboard
  HIGHLIGHT_DASHBOARD_SET_ABOUT_PAGE: `${CONTENT_HIGHLIGHTS_DASHBOARD_PREFIX}.set_item_about_page.clicked`,
  HIGHLIGHT_DASHBOARD_PUBLISHED_HIGHLIGHT_SET_CARD: `${CONTENT_HIGHLIGHTS_DASHBOARD_PREFIX}.published_highlight_set_card.clicked`,
  HIGHLIGHT_DASHBOARD_SET_CATALOG_VISIBILITY: `${CONTENT_HIGHLIGHTS_DASHBOARD_PREFIX}.set_catalog_visibility.clicked`,
  HIGHLIGHT_DASHBOARD_SELECT_TAB: `${CONTENT_HIGHLIGHTS_DASHBOARD_PREFIX}.tab.clicked`,
  // Highlight Creation
  NEW_HIGHLIHT_MAX_REACHED: `${CONTENT_HIGHLIGHTS_DASHBOARD_PREFIX}.create_new_content_highlight.max_reached.clicked`,
  NEW_HIGHLIGHT: `${CONTENT_HIGHLIGHTS_DASHBOARD_PREFIX}.create_new_content_highlight.clicked`,
};

const SETTINGS_ACCESS_PREFIX = `${SETTINGS_PREFIX}.ACCESS`;

export const SETTINGS_ACCESS_EVENTS = {
  UNIVERSAL_LINK_TOGGLE: `${SETTINGS_ACCESS_PREFIX}.universal-link.toggle.clicked`,
  UNIVERSAL_LINK_GENERATE: `${SETTINGS_ACCESS_PREFIX}.universal-link.generate.clicked`,
  UNIVERSAL_LINK_COPIED: `${SETTINGS_ACCESS_PREFIX}.universal-link.copied.clicked`,
  UNIVERSAL_LINK_DEACTIVATE: `${SETTINGS_ACCESS_PREFIX}.universal-link.deactivate.clicked`,
};

export const SUBSCRIPTION_EVENTS = {
  TABLE: SUBSCRIPTION_TABLE_EVENTS,
};

export const LEARNER_CREDIT_MANAGEMENT_EVENTS = {
  TAB_CHANGED: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.budget_detail.tab.changed`,
  EMPTY_STATE_CTA: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.budget_detail.empty_state_cta_to_catalog.clicked`,
  VIEW_COURSE: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.catalog_search.view_course.clicked`,
  // Assignment Modal
  TOGGLE_NEXT_STEPS: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.next_steps_collapsible.toggled`,
  TOGGLE_IMPACT_ON_YOUR_LEARNERS: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.impact_on_your_learners_collapsible.toggled`,
  TOGGLE_MANAGING_THIS_ASSIGNMENT: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.managing_this_assignment_collapsible.toggled`,
  OPEN_ASSIGNMENT_MODAL_ASSIGN_COURSE: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.catalog_search.assign_course_cta.clicked`,
  CLOSE_ASSIGNMENT_MODAL_ASSIGNED: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.close_modal_assigned.clicked`,
  CLOSE_ASSIGNMENT_MODAL_CANCEL: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.close_modal_cancel.clicked`,
  CLOSE_ASSIGNMENT_MODAL_EXIT: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.close_modal_exit.clicked`,
  CLOSE_ASSIGNMENT_MODAL_ASSIGNMENT_ALLOCATION_ERROR: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.exit_assignment_allocation_modal.clicked`,
  // Successful allocation
  ASSIGNMENT_ALLOCATED_LEARNER_COUNT: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.assignment_allocation.assigned`,
  // Input Validation and API error allocation
  EMAIL_ADDRESS_VALIDATION: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.email_validation.changed`,
  ASSIGNMENT_ALLOCATION_ERROR: `${LEARNER_CREDIT_MANAGEMENT_PREFIX}.assignment_modal.assignment_allocation.errored`,
};

const EVENT_NAMES = {
  SUBSCRIPTIONS: SUBSCRIPTION_EVENTS,
  CONTENT_HIGHLIGHTS: CONTENT_HIGHLIGHTS_EVENTS,
  LEARNER_CREDIT_MANAGEMENT: LEARNER_CREDIT_MANAGEMENT_EVENTS,
};

export default EVENT_NAMES;

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

const SUBSCRIPTION_TABLE_PREFIX = `${SUBSCRIPTION_PREFIX}.table`;

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

const EVENT_NAMES = {
  SUBSCRIPTIONS: SUBSCRIPTION_EVENTS,
};

export default EVENT_NAMES;

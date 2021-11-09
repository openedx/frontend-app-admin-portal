/**
 * @file Documents event tracking name space
 *
 * Event names should fallow the convention of:
 * <project name>.<product name>.<location>.<action>
 *
 * @example edx.ui.admin_portal. (project) subscriptions. (product) table. (location) click (action)
 * edx.ui.admin_portal.subscriptions.table.click
 */

/**
 * @constant PROJECT_NAME leading project identifier for event names
 */
const PROJECT_NAME = 'edx.ui.admin_portal';

/**
 * Subscription detail table events
 */
const SUBSCRIPTION_TABLE = `${PROJECT_NAME}.subscriptions.table`;
export const subscriptionsTableEventNames = {
  // Row Actions
  remindRowClick: `${SUBSCRIPTION_TABLE}.remind.row.click`,
  remindRowSubmit: `${SUBSCRIPTION_TABLE}.remind.row.submit`,
  remindRowCancel: `${SUBSCRIPTION_TABLE}.remind.row.cancel`,
  revokeRowClick: `${SUBSCRIPTION_TABLE}.revoke.row.click`,
  revokeRowSubmit: `${SUBSCRIPTION_TABLE}.revoke.row.submit`,
  revokeRowCancel: `${SUBSCRIPTION_TABLE}.revoke.row.cancel`,
  // Bulk Actions
  remindBulkClick: `${SUBSCRIPTION_TABLE}.remind.bulk.click`,
  remindBulkSubmit: `${SUBSCRIPTION_TABLE}.remind.bulk.submit`,
  remindBulkCancel: `${SUBSCRIPTION_TABLE}.remind.bulk.cancel`,
  revokeBulkClick: `${SUBSCRIPTION_TABLE}.revoke.bulk.click`,
  revokeBulkSubmit: `${SUBSCRIPTION_TABLE}.revoke.bulk.submit`,
  revokeBulkCancel: `${SUBSCRIPTION_TABLE}.revoke.bulk.cancel`,
};

export const subscriptionExpiration = {
};

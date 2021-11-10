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
export const PROJECT_NAME = 'edx.ui.admin_portal';

/**
 * Subscription detail table events
 */
const SUBSCRIPTION_TABLE = `${PROJECT_NAME}.subscriptions.table`;
export const subscriptionsTableEventNames = {
  // Pagination
  paginationNext: `${SUBSCRIPTION_TABLE}.pagination.next.click`,
  paginationPrevious: `${SUBSCRIPTION_TABLE}.pagination.previous.click`,
  // Filter Actions
  filterStatusChange: `${SUBSCRIPTION_TABLE}.filter.status.change`,
  filterEmailChange: `${SUBSCRIPTION_TABLE}.filter.email.change`,
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

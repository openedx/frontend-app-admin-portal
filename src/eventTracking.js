/**
 * @file Documents event tracking name space
 */

export const PROJECT_NAME = 'edx.ui.admin_portal';

/**
 * Subscription detail table events
 */
export const subscriptionsTableEventNames = {
  base: 'subscriptions.table',
  get remindRowClick() {
    return `${PROJECT_NAME}.${this.base}.remind.row.click`;
  },
  get remindRowSubmit() {
    return `${PROJECT_NAME}.${this.base}.remind.row.submit`;
  },
  get remindRowCancel() {
    return `${PROJECT_NAME}.${this.base}.remind.row.cancel`;
  },
  get revokeRowClick() {
    return `${PROJECT_NAME}.${this.base}.revoke.row.click`;
  },
  get revokeRowSubmit() {
    return `${PROJECT_NAME}.${this.base}.revoke.row.submit`;
  },
  get revokeRowCancel() {
    return `${PROJECT_NAME}.${this.base}.revoke.row.cancel`;
  },
};

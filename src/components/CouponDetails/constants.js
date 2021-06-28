/* eslint-disable import/prefer-default-export */

export const COUPON_FILTER_TYPES = {
  unassigned: 'unassigned',
  unredeemed: 'unredeemed',
  partiallyRedeemed: 'partially-redeemed',
  redeemed: 'redeemed',
};

export const COUPON_FILTERS = {
  unassigned: {
    label: 'Unassigned',
    value: COUPON_FILTER_TYPES.unassigned,
  },
  unredeemed: {
    label: 'Unredeemed',
    value: COUPON_FILTER_TYPES.unredeemed,
  },
  partiallyRedeemed: {
    label: 'Partially redeemed',
    value: COUPON_FILTER_TYPES.partiallyRedeemed,
  },
  redeemed: {
    label: 'Redeemed',
    value: COUPON_FILTER_TYPES.redeemed,
  },
};

export const ACTIONS = {
  remind: {
    label: 'Remind',
    value: 'remind',
  },
  assign: {
    label: 'Assign',
    value: 'assign',
  },
  revoke: {
    label: 'Revoke',
    value: 'revoke',
  },
};

export const FILTER_OPTIONS = [{
  label: COUPON_FILTERS.unassigned.label,
  value: COUPON_FILTERS.unassigned.value,
}, {
  label: COUPON_FILTERS.unredeemed.label,
  value: COUPON_FILTERS.unredeemed.value,
}, {
  label: COUPON_FILTERS.partiallyRedeemed.label,
  value: COUPON_FILTERS.partiallyRedeemed.value,
}, {
  label: COUPON_FILTERS.redeemed.label,
  value: COUPON_FILTERS.redeemed.value,
}];

export const BULK_ACTION_SELECT_OPTIONS = [{
  label: ACTIONS.assign.label,
  value: ACTIONS.assign.value,
}, {
  label: ACTIONS.remind.label,
  value: ACTIONS.remind.value,
}, {
  label: ACTIONS.revoke.label,
  value: ACTIONS.revoke.value,
}];

export const BULK_ACTION = {
  label: 'Bulk action',
  name: 'bulk-actions',
  controlId: 'bulkActions',
};

export const DETAILS_TEXT = {
  expanded: 'Detailed breakdown',
  unexpanded: 'Details',
  expandedScreenReader: 'Close details',
  unexpandedScreenReader: 'Show details',
};

export const COLUMNS = {
  redemptions: {
    label: 'Redemptions',
    key: 'redemptions',
  },
  code: {
    label: 'Code',
    key: 'code',
  },
  assignmentsRemaining: {
    label: 'Assignments remaining',
    key: 'assignments_remaining',
  },
  actions: {
    label: 'Actions',
    key: 'actions',
  },
  lastReminderDate: {
    label: 'Last reminder date',
    key: 'last_reminder_date',
  },
  assignmentDate: {
    label: 'Assignment date',
    key: 'assignment_date',
  },
  assignedTo: {
    label: 'Assigned to',
    key: 'assigned_to',
  },
  redeemedBy: {
    label: 'Redeemed by',
    key: 'assigned_to',
  },
};

const COMMON_COLUMNS = [
  COLUMNS.redemptions,
  COLUMNS.code,
];

const REDEMTION_COLUMNS = [
  ...COMMON_COLUMNS,
  COLUMNS.assignmentDate,
  COLUMNS.lastReminderDate,
  COLUMNS.actions,
];

export const DEFAULT_TABLE_COLUMNS = {
  [COUPON_FILTERS.unassigned.value]: [
    ...COMMON_COLUMNS,
    COLUMNS.assignmentsRemaining,
    COLUMNS.actions,
  ],
  [COUPON_FILTERS.unredeemed.value]: [
    COLUMNS.assignedTo,
    ...REDEMTION_COLUMNS,
  ],
  [COUPON_FILTERS.partiallyRedeemed.value]: [
    COLUMNS.assignedTo,
    ...REDEMTION_COLUMNS,
  ],
  [COUPON_FILTERS.redeemed.value]: [
    COLUMNS.redeemedBy,
    ...COMMON_COLUMNS,
    COLUMNS.assignmentDate,
    COLUMNS.lastReminderDate,
  ],
};

export const SUCCESS_MESSAGES = {
  assign: 'Successfully assigned code(s)',
  remind: 'Reminder request processed.',
  revoke: 'Successfully revoked code(s)',
};

/* eslint-disable import/prefer-default-export */

export const COUPON_FILTER_TYPES = {
  unassigned: 'unassigned',
  unredeemed: 'unredeemed',
  partiallyRedeemed: 'partially-redeemed',
  redeemed: 'redeemed',
};

export const COUPON_FILTER_OPTIONS = {
  unassigned: 'Unassigned',
  unredeemed: 'Unredeemed',
  partiallyRedeemed: 'Partially redeemed',
  redeemed: 'Redeemed',
};

export const ACTION_LABELS = {
  remind: 'Remind',
  assign: 'Assign',
  revoke: 'Revoke',
};

export const ACTION_TYPES = {
  remind: 'remind',
  revoke: 'revoke',
  assign: 'assign',
};

export const FILTER_OPTIONS = [{
  label: COUPON_FILTER_OPTIONS.unassigned,
  value: COUPON_FILTER_TYPES.unassigned,
}, {
  label: COUPON_FILTER_OPTIONS.unredeemed,
  value: COUPON_FILTER_TYPES.unredeemed,
}, {
  label: COUPON_FILTER_OPTIONS.partiallyRedeemed,
  value: COUPON_FILTER_TYPES.partiallyRedeemed,
}, {
  label: COUPON_FILTER_OPTIONS.redeemed,
  value: COUPON_FILTER_TYPES.redeemed,
}];

export const BULK_ACTION_SELECT_OPTIONS = [{
  label: ACTION_LABELS.assign,
  value: ACTION_TYPES.assign,
}, {
  label: ACTION_LABELS.remind,
  value: ACTION_TYPES.remind,
}, {
  label: ACTION_LABELS.revoke,
  value: ACTION_TYPES.revoke,
}];

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
  [COUPON_FILTER_TYPES.unassigned]: [
    ...COMMON_COLUMNS,
    COLUMNS.assignmentsRemaining,
    COLUMNS.actions,
  ],
  [COUPON_FILTER_TYPES.unredeemed]: [
    COLUMNS.assignedTo,
    ...REDEMTION_COLUMNS,
  ],
  [COUPON_FILTER_TYPES.partiallyRedeemed]: [
    COLUMNS.assignedTo,
    ...REDEMTION_COLUMNS,
  ],
  [COUPON_FILTER_TYPES.redeemed]: [
    COLUMNS.redeemedBy,
    ...COMMON_COLUMNS,
    COLUMNS.assignmentDate,
    COLUMNS.lastReminderDate,
  ],
};

/* eslint-disable import/prefer-default-export */

export const COUPON_FILTER_TYPES = {
  unassigned: 'unassigned',
  unredeemed: 'unredeemed',
  partiallyRedeemed: 'partially-redeemed',
  redeemed: 'redeemed',
};

export const COUPON_VISIBILITY_OPTIONS = {
  both: 'both',
  public: 'public',
  private: 'private',
};

export const ACTION_LABELS = {
  remind: 'Remind',
  assign: 'Assign',
  revoke: 'Revoke',
  makePublic: 'Make public',
  makePrivate: 'Make private',
};

export const ACTION_TYPES = {
  remind: 'remind',
  revoke: 'revoke',
  assign: 'assign',
  makePublic: 'make_public',
  makePrivate: 'make_private',
};

export const FILTER_OPTIONS = [{
  label: 'Unassigned',
  value: COUPON_FILTER_TYPES.unassigned,
}, {
  label: 'Unredeemed',
  value: COUPON_FILTER_TYPES.unredeemed,
}, {
  label: 'Partially Redeemed',
  value: COUPON_FILTER_TYPES.partiallyRedeemed,
}, {
  label: 'Redeemed',
  value: COUPON_FILTER_TYPES.redeemed,
}];

export const VISIBILITY_OPTIONS = [{
  label: 'Both',
  value: 'both',
}, {
  label: 'Public',
  value: 'public',
}, {
  label: 'Private',
  value: 'private',
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
  visibility: {
    label: 'Visibility',
    key: 'is_public',
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

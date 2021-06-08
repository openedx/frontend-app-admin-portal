/* eslint-disable import/prefer-default-export */

export const COUPON_FILTER_TYPES = {
  unassigned: 'unassigned',
  unredeemed: 'unredeemed',
  partiallyRedeemed: 'partially-redeemed',
  redeemed: 'redeemed',
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
  value: undefined,
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

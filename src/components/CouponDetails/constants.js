/* eslint-disable import/prefer-default-export */

export const COUPON_FILTER_TYPES = {
  unassigned: 'unassigned',
  unredeemed: 'unredeemed',
  partiallyRedeemed: 'partially-redeemed',
  redeemed: 'redeemed',
};

export const BUTTON_LABELS = {
  remind: 'Remind',
  assign: 'Assign',
  revoke: 'Revoke',
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
  label: 'Assign',
  value: 'assign',
}, {
  label: 'Remind',
  value: 'remind',
}, {
  label: 'Revoke',
  value: 'revoke',
}];

export const ACTION_TYPES = {
  remind: 'remind',
  revoke: 'revoke',
  assign: 'assign',
};

/* eslint-disable import/prefer-default-export */
import { SINGLE_USE, ONCE_PER_CUSTOMER } from '../../data/constants/coupons';
import {
  ACTION_LABELS, ACTION_TYPES, COUPON_FILTER_TYPES, FILTER_OPTIONS,
} from './constants';

export const getFilterOptions = (usageLimitation) => {
  const shouldHidePartialRedeem = [SINGLE_USE, ONCE_PER_CUSTOMER].includes(usageLimitation);
  let options = FILTER_OPTIONS;

  if (shouldHidePartialRedeem) {
    options = FILTER_OPTIONS.filter(option => option.value !== COUPON_FILTER_TYPES.partiallyRedeemed);
  }

  return options;
};

export const getFirstNonDisabledOption = (options) => {
  const firstNonDisabledOption = options.find(option => !option.disabled);

  if (firstNonDisabledOption) {
    return firstNonDisabledOption.value;
  }

  return options[0].value;
};

export const getBASelectOptions = ({
  hasPublicCodes,
  isAssignView,
  isRedeemedView,
  hasTableData,
  couponAvailable,
  numUnassignedCodes,
  numSelectedCodes,
}) => ([{
  label: ACTION_LABELS.assign,
  value: ACTION_TYPES.assign,
  disabled: hasPublicCodes || !isAssignView || isRedeemedView || !hasTableData || !couponAvailable || numUnassignedCodes === 0, // eslint-disable-line max-len
}, {
  label: ACTION_LABELS.remind,
  value: ACTION_TYPES.remind,
  disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable,
}, {
  label: ACTION_LABELS.revoke,
  value: ACTION_TYPES.revoke,
  disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable || numSelectedCodes === 0, // eslint-disable-line max-len
}]);

export const getMakePublicField = (hasTableData, numSelectedCodes) => ({
  label: ACTION_LABELS.makePublic,
  value: ACTION_TYPES.makePublic,
  disabled: !hasTableData || numSelectedCodes === 0,
});

export const getMakePrivateField = (hasTableData, numSelectedCodes) => ({
  label: ACTION_LABELS.makePrivate,
  value: ACTION_TYPES.makePrivate,
  disabled: !hasTableData || numSelectedCodes === 0,
});

export const shouldShowSelectAllStatusAlert = ({
  tableData, hasAllCodesSelected, selectedToggle, selectedCodes,
}) => {
  if (!tableData || selectedToggle !== COUPON_FILTER_TYPES.unassigned) {
    return false;
  }

  if (hasAllCodesSelected) {
    return true;
  }

  return (
    selectedCodes.length === tableData.results.length
    && selectedCodes.length !== tableData.count
  );
};

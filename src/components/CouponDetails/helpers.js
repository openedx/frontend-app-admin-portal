/* eslint-disable import/prefer-default-export */
import { SINGLE_USE, ONCE_PER_CUSTOMER } from '../../data/constants/coupons';
import {
  ACTIONS, COUPON_FILTERS, FILTER_OPTIONS,
} from './constants';

export const getFilterOptions = (usageLimitation) => {
  const shouldHidePartialRedeem = [SINGLE_USE, ONCE_PER_CUSTOMER].includes(usageLimitation);
  let options = FILTER_OPTIONS;

  if (shouldHidePartialRedeem) {
    options = FILTER_OPTIONS.filter(option => option.value !== COUPON_FILTERS.partiallyRedeemed.value);
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
  isAssignView,
  isRedeemedView,
  hasTableData,
  couponAvailable,
  numUnassignedCodes,
  numSelectedCodes,
}) => ([{
  label: ACTIONS.assign.label,
  value: ACTIONS.assign.value,
  disabled: !isAssignView || isRedeemedView || !hasTableData || !couponAvailable || numUnassignedCodes === 0, // eslint-disable-line max-len
}, {
  label: ACTIONS.remind.label,
  value: ACTIONS.remind.value,
  disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable,
}, {
  label: ACTIONS.revoke.label,
  value: ACTIONS.revoke.value,
  disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable || numSelectedCodes === 0, // eslint-disable-line max-len
}]);

export const shouldShowSelectAllStatusAlert = ({
  tableData, hasAllCodesSelected, selectedToggle, selectedCodes,
}) => {
  if (!tableData || selectedToggle !== COUPON_FILTERS.unassigned.value) {
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

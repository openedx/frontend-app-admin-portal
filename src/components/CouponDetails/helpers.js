/* eslint-disable import/prefer-default-export */
import { SINGLE_USE, ONCE_PER_CUSTOMER } from '../../data/constants/coupons';
import { FILTER_OPTIONS } from './constants';

export const getFilterOptions = (usageLimitation) => {
  const shouldHidePartialRedeem = [SINGLE_USE, ONCE_PER_CUSTOMER].includes(usageLimitation);
  let options = FILTER_OPTIONS;

  if (shouldHidePartialRedeem) {
    options = FILTER_OPTIONS.filter(option => option.value !== 'partially-redeemed');
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

export const getBulkActionSelectOptions = ({
  hasPublicCodes, isAssignView, isRedeemedView, hasTableData, couponAvailable, numUnassignedCodes, numSelectedCodes
}) => ([{
  label: 'Assign',
  value: 'assign',
  disabled: hasPublicCodes || !isAssignView || isRedeemedView || !hasTableData || !couponAvailable || numUnassignedCodes === 0, // eslint-disable-line max-len
}, {
  label: 'Remind',
  value: 'remind',
  disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable,
}, {
  label: 'Revoke',
  value: 'revoke',
  disabled: isAssignView || isRedeemedView || !hasTableData || !couponAvailable || numSelectedCodes === 0, // eslint-disable-line max-len
}]);

export const getMakePublicField = (hasTableData, numSelectedCodes) => ({
  label: 'Make Public',
  value: 'make_public',
  disabled: !hasTableData || numSelectedCodes === 0,
});

export const getMakePrivateField = (hasTableData, numSelectedCodes) => ({
  label: 'Make Private',
  value: 'make_private',
  disabled: !hasTableData || numSelectedCodes === 0,
});

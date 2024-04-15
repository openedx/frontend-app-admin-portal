/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
import {
  SINGLE_USE, ONCE_PER_CUSTOMER, MULTI_USE, MULTI_USE_PER_CUSTOMER,
} from '../../data/constants/coupons';
import { ACTIONS, COUPON_FILTERS, FILTER_OPTIONS } from './constants';
import { getBASelectOptions, getFilterOptions, getFirstNonDisabledOption } from './helpers';

describe('getFilterOptions', () => {
  test.each([
    [MULTI_USE],
    [MULTI_USE_PER_CUSTOMER],
  ])('includes partially redeemed for partially redeemable coupons %p', (usageLimitation) => {
    expect(getFilterOptions(usageLimitation)).toEqual(FILTER_OPTIONS);
  });
  test.each([
    [SINGLE_USE],
    [ONCE_PER_CUSTOMER],
  ])('does not include partially redeemed for single-use coupons %p', (usageLimitation) => {
    const expected = [{
      label: 'Unassigned',
      value: 'unassigned',
    }, {
      label: 'Unredeemed',
      value: 'unredeemed',
    }, {
      label: 'Redeemed',
      value: 'redeemed',
    }];
    expect(getFilterOptions(usageLimitation)).toEqual(expected);
  });
});

describe('getFirstNonDisabledOption', () => {
  test.each([
    [[{ value: 'foo', disabled: true }, { value: 'bar' }], 'bar'],
    [[{ value: 'foo' }, { value: 'bar', disabled: false }, { value: 'baz', disabled: true }], 'foo'],
    [[{ value: 'foo', disabled: true }, { value: 'bar', disabled: true }, { value: 'baz', disabled: false }], 'baz'],
    [[{ value: 'foo', disabled: false }, { value: 'bar', disabled: true }, { value: 'baz', disabled: true }], 'foo'],
  ])('it returns the first non-disabled option %#', (options, expected) => {
    expect(getFirstNonDisabledOption(options)).toEqual(expected);
  });
  it('returns the first option if all are disabled', () => {
    const options = [{ value: 'foo', disabled: true }, { value: 'bar', disabled: true }, { value: 'baz', disabled: true }];
    expect(getFirstNonDisabledOption(options)).toEqual('foo');
  });
});

describe('getBASelectOptions', () => {
  describe('assign option', () => {
    const defaultAssignOptions = {
      isAssignView: true,
      isRedeemedView: false,
      hasTableData: true,
      couponAvailable: true,
      numUnassignedCodes: 3,
      numSelectedCodes: 2,
    };
    it('has the correct label and value', () => {
      const assignOption = getBASelectOptions(defaultAssignOptions)[0];
      expect(assignOption.label).toEqual(ACTIONS.assign.label);
      expect(assignOption.value).toEqual(ACTIONS.assign.value);
    });
    test.each([
      [{ ...defaultAssignOptions }, false],

      [{ ...defaultAssignOptions, isRedeemedView: true }, true],
      [{ ...defaultAssignOptions, isAssignView: false }, true],
      [{ ...defaultAssignOptions, hasTableData: false }, true],
      [{ ...defaultAssignOptions, numUnassignedCodes: 0 }, true],
    ])('has the correct disabled value %#', (options, expected) => {
      const assignOption = getBASelectOptions(options)[0];
      expect(assignOption.disabled).toEqual(expected);
    });
  });
  describe('remind option', () => {
    const defaultRemindOptions = {
      isAssignView: false,
      isRedeemedView: false,
      hasTableData: true,
      couponAvailable: true,
      numUnssignedCodes: 3,
      numSelectedCodes: 2,
    };
    it('has the correct label and value', () => {
      const remindOption = getBASelectOptions(defaultRemindOptions)[1];
      expect(remindOption.label).toEqual(ACTIONS.remind.label);
      expect(remindOption.value).toEqual(ACTIONS.remind.value);
    });
    test.each([
      [{ ...defaultRemindOptions }, false],
      [{ ...defaultRemindOptions, isRedeemedView: true }, true],
      [{ ...defaultRemindOptions, isAssignView: true }, true],
      [{ ...defaultRemindOptions, hasTableData: false }, true],
      [{ ...defaultRemindOptions, couponAvailable: false }, true],
    ])('has the correct disabled value %#', (options, expected) => {
      const remindOption = getBASelectOptions(options)[1];
      expect(remindOption.disabled).toEqual(expected);
    });
  });
  describe('revoke option', () => {
    const defaultRemindOptions = {
      isAssignView: false,
      isRedeemedView: false,
      hasTableData: true,
      couponAvailable: true,
      numUnssignedCodes: 3,
      numSelectedCodes: 2,
    };
    it('has the correct label and value', () => {
      const revokeOption = getBASelectOptions(defaultRemindOptions)[2];
      expect(revokeOption.label).toEqual(ACTIONS.revoke.label);
      expect(revokeOption.value).toEqual(ACTIONS.revoke.value);
    });
    test.each([
      [{ ...defaultRemindOptions }, false],
      [{ ...defaultRemindOptions, isRedeemedView: true }, true],
      [{ ...defaultRemindOptions, isAssignView: true }, true],
      [{ ...defaultRemindOptions, hasTableData: false }, true],
      [{ ...defaultRemindOptions, couponAvailable: false }, true],
      [{ ...defaultRemindOptions, numSelectedCodes: 0 }, true],
    ])('has the correct disabled value %#', (options, expected) => {
      const revokeOption = getBASelectOptions(options)[2];
      expect(revokeOption.disabled).toEqual(expected);
    });
  });
});

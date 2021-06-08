/* eslint-disable max-len */
/* eslint-disable object-curly-newline */
import {
  SINGLE_USE, ONCE_PER_CUSTOMER, MULTI_USE, MULTI_USE_PER_CUSTOMER,
} from '../../data/constants/coupons';
import { COUPON_FILTER_TYPES, FILTER_OPTIONS } from './constants';
import { getFilterOptions, getFirstNonDisabledOption, shouldShowSelectAllStatusAlert } from './helpers';

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
  ])('it returns the first non-disabled option %#', (options, expected) => {
    expect(getFirstNonDisabledOption(options)).toEqual(expected);
  });
  it('returns the first option if all are disabled', () => {
    const options = [{ value: 'foo', disabled: true }, { value: 'bar', disabled: true }, { value: 'baz', disabled: true }];
    expect(getFirstNonDisabledOption(options)).toEqual('foo');
  });
});

describe('shouldShowSelectAllStatusAlert', () => {
  test.each([
    [{ tableData: null, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: false, selectedCodes: [] }],
    [{ tableData: undefined, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: false, selectedCodes: [] }],
  ])('returns false when there is no table data', (options) => {
    expect(shouldShowSelectAllStatusAlert(options)).toEqual(false);
  });
  test.each([
    [{ tableData: true, selectedToggle: COUPON_FILTER_TYPES.partiallyRedeemed, hasAllCodesSelected: false, selectedCodes: [] }],
    [{ tableData: true, selectedToggle: COUPON_FILTER_TYPES.redeemed, hasAllCodesSelected: false, selectedCodes: [] }],
    [{ tableData: true, selectedToggle: COUPON_FILTER_TYPES.unredeemed, hasAllCodesSelected: false, selectedCodes: [] }],
  ])('returns false when the selected toggle is not unassigned', (options) => {
    expect(shouldShowSelectAllStatusAlert(options)).toEqual(false);
  });
  it('returns true if all codes are selected', () => {
    const options = { tableData: true, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: true, selectedCodes: [] };
    expect(shouldShowSelectAllStatusAlert(options)).toEqual(true);
  });
  test.each([
    [{ tableData: { results: Array(3) }, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: false, selectedCodes: Array(2) }],
    [{ tableData: { results: Array(100) }, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: false, selectedCodes: Array(25) }],
  ])('returns false if selected codes do not have the same length as the table data results', (options) => {
    expect(shouldShowSelectAllStatusAlert(options)).toEqual(false);
  });
  test.each([
    [{ tableData: { results: Array(2), count: 4 }, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: false, selectedCodes: Array(2) }],
    [{ tableData: { results: Array(100), count: 200 }, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: false, selectedCodes: Array(100) }],
  ])('returns true if the selected codes does not equal the tableData count', (options) => {
    expect(shouldShowSelectAllStatusAlert(options)).toEqual(true);
  });
  it('returns false if the code count matches the tableData count', () => {
    const options = { tableData: { results: Array(100), count: 100 }, selectedToggle: COUPON_FILTER_TYPES.unassigned, hasAllCodesSelected: false, selectedCodes: Array(100) };
    expect(shouldShowSelectAllStatusAlert(options)).toEqual(false);
  });
});

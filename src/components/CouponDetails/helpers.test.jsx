import {
  SINGLE_USE, ONCE_PER_CUSTOMER, MULTI_USE, MULTI_USE_PER_CUSTOMER,
} from '../../data/constants/coupons';
import { FILTER_OPTIONS } from './constants';
import { getFilterOptions, getFirstNonDisabledOption } from './helpers';

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
  ])('it returns the first non-disabled option %i', (options, expected) => {
    expect(getFirstNonDisabledOption(options)).toEqual(expected);
  });
  it('returns the first option if all are disabled', () => {
    const options = [{ value: 'foo', disabled: true }, { value: 'bar', disabled: true }, { value: 'baz', disabled: true }];
    expect(getFirstNonDisabledOption(options)).toEqual('foo');
  });
});

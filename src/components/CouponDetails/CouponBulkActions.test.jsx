import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { ACTIONS, BULK_ACTION, COUPON_FILTER_TYPES } from './constants';
import CouponBulkActions from './CouponBulkActions';

const props = {
  handleBulkAction: jest.fn(),
  selectedToggle: COUPON_FILTER_TYPES.unassigned,
  hasTableData: true,
  couponAvailable: true,
  isTableLoading: false,
  numSelectedCodes: 0,
  numUnassignedCodes: 3,
};

describe('CouponBulkActions', () => {
  beforeEach(() => {
    props.handleBulkAction.mockClear();
  });
  it('has disabled select and button when table is loading', () => {
    const modifiedProps = {
      ...props,
      isTableLoading: true,
    };
    render(<CouponBulkActions {...modifiedProps} />);
    expect(screen.getByLabelText(BULK_ACTION.label)).toHaveProperty('disabled', true);
    expect(screen.getByText('Go')).toHaveProperty('disabled', true);
  });
  it('has disabled select and button when no actions are available', () => {
    const modifiedProps = {
      ...props,
      couponAvailable: false,
    };
    render(<CouponBulkActions {...modifiedProps} />);
    expect(screen.getByLabelText(BULK_ACTION.label)).toHaveProperty('disabled', true);
    expect(screen.getByText('Go')).toHaveProperty('disabled', true);
  });
  it('does not disable select and buttons when options are available', () => {
    render(<CouponBulkActions {...props} />);
    expect(screen.getByLabelText(BULK_ACTION.label)).toHaveProperty('disabled', false);
    expect(screen.getByText('Go')).toHaveProperty('disabled', false);
  });
  it('sets the value to the first non-disabled option by default - unassigned', () => {
    // getting the first non-disable option and getting the options is tested separately in helpers.test.js
    render(<CouponBulkActions {...props} />);
    screen.getByText(ACTIONS.assign.label);
    expect(screen.getByLabelText(BULK_ACTION.label)).toHaveProperty('value', ACTIONS.assign.value);
  });
  it('sets the value to the first non-disabled option by default - unredeeemed', () => {
    // getting the first non-disable option and getting the options is tested separately in helpers.test.js
    render(<CouponBulkActions {...props} selectedToggle={COUPON_FILTER_TYPES.unredeemed} />);
    screen.getByText(ACTIONS.remind.label);
    expect(screen.getByLabelText(BULK_ACTION.label)).toHaveProperty('value', ACTIONS.remind.value);
  });
  it('changes the value when a new value is selected', async () => {
    render(<CouponBulkActions {...props} selectedToggle={COUPON_FILTER_TYPES.unredeemed} numSelectedCodes={1} />);
    expect(screen.getByText(ACTIONS.remind.label)).toHaveProperty('disabled', false);
    expect(screen.getByText(ACTIONS.revoke.label)).toHaveProperty('disabled', false);
    userEvent.selectOptions(screen.getByLabelText(BULK_ACTION.label), [ACTIONS.revoke.label]);
    expect(await screen.findByLabelText(BULK_ACTION.label)).toHaveProperty('value', ACTIONS.revoke.value);
  });
  it('calls handle bulk action with the selected value - default', () => {
    render(<CouponBulkActions {...props} />);
    userEvent.click(screen.getByText('Go'));
    expect(props.handleBulkAction).toHaveBeenCalledWith(ACTIONS.assign.value);
  });
  it('calls handle bulk action with the selected value - after change', async () => {
    render(<CouponBulkActions {...props} selectedToggle={COUPON_FILTER_TYPES.unredeemed} numSelectedCodes={1} />);
    expect(screen.getByText(ACTIONS.remind.label)).toHaveProperty('disabled', false);
    expect(screen.getByText(ACTIONS.revoke.label)).toHaveProperty('disabled', false);
    userEvent.selectOptions(screen.getByLabelText(BULK_ACTION.label), [ACTIONS.revoke.label]);
    userEvent.click(screen.getByText('Go'));
    expect(props.handleBulkAction).toHaveBeenCalledWith(ACTIONS.revoke.value);
  });
});

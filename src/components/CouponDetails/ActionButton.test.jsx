import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ActionButton from './ActionButton';
import { ACTION_LABELS, COUPON_FILTER_TYPES } from './constants';

const fakeCouponData = {
  id: 12,
  errors: [],
  available: true,
  title: 'Best coupon',
};

const fakeRedemptions = {
  used: 1,
  total: 2,
  num_assignments: 1,
};
const props = {
  couponData: fakeCouponData,
  selectedToggle: COUPON_FILTER_TYPES.unassigned,
  code: {
    code: 'itsACode',
    redemptions: fakeRedemptions,
    is_public: false,
  },
  handleCodeActionSuccess: jest.fn(),
  setModalState: jest.fn(),
};

describe('CouponDetails ActionButton', () => {
  it('returns null if the coupon is unavailable', () => {
    const modifiedProps = {
      ...props,
      couponData: {
        ...fakeCouponData,
        available: false,
      },
    };
    const { container } = render(<ActionButton {...modifiedProps} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('returns null if all redepmtions have been used', () => {
    const modifiedProps = {
      ...props,
      code: {
        ...props.code,
        redemptions: { ...props.code.redemptions, total: 3, used: 3 },
      },
    };
    const { container } = render(<ActionButton {...modifiedProps} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('does not render remind button if there is an error', () => {
    const modifiedProps = {
      ...props,
      couponData: {
        ...fakeCouponData,
        errors: [{ code: props.code.code }],
      },
      code: {
        ...props.code,
        assigned_to: 'foo@bar.com',
      },
    };
    render(<ActionButton {...modifiedProps} />);
    expect(screen.queryByText(ACTION_LABELS.remind)).not.toBeInTheDocument();
    expect(screen.getByText(ACTION_LABELS.revoke)).toBeInTheDocument();
  });
  test.each([
    [[]],
    [[{ code: 'someOtherCode ' }]],
  ])('shows remind and revoke buttons if code is assigned and there are no errors %#', (errors) => {
    const modifiedProps = {
      ...props,
      couponData: {
        ...fakeCouponData,
        errors,
      },
      code: {
        ...props.code,
        assigned_to: 'foo@bar.com',
      },
    };
    render(<ActionButton {...modifiedProps} />);
    expect(screen.getByText(ACTION_LABELS.remind)).toBeInTheDocument();
    expect(screen.getByText(ACTION_LABELS.revoke)).toBeInTheDocument();
  });
  it('returns null for an unassigned and public code', () => {
    const modifiedProps = {
      ...props,
      code: {
        ...props.code,
        is_public: true,
      },
    };
    const { container } = render(<ActionButton {...modifiedProps} />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders an assign button', () => {
    render(<ActionButton {...props} />);
    expect(screen.queryByText(ACTION_LABELS.remind)).not.toBeInTheDocument();
    expect(screen.queryByText(ACTION_LABELS.revoke)).not.toBeInTheDocument();
    expect(screen.getByText(ACTION_LABELS.assign)).toBeInTheDocument();
  });
});

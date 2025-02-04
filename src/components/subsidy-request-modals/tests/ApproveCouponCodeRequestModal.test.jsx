import React from 'react';
import {
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApproveCouponCodeRequestModal } from '../ApproveCouponCodeRequestModal';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import * as hooks from '../data/hooks';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_REQUEST_UUID = 'test-coupon-code-request-uuid';
const TEST_COURSE_RUN_ID = 'edx+101';
const TEST_COUPON_ID = 1;
const TEST_COUPON_ID_2 = 2;

jest.mock('../data/hooks');

jest.mock('../../../data/services/EnterpriseAccessApiService', () => ({
  approveCouponCodeRequests: jest.fn(),
}));

describe('<ApproveCouponCodeRequestModal />', () => {
  const basicProps = {
    couponCodeRequest: {
      uuid: TEST_REQUEST_UUID,
      courseId: TEST_COURSE_RUN_ID,
      enterpriseCustomerUUID: TEST_ENTERPRISE_UUID,
    },
    coupons: {
      results: [
        {
          id: 1,
        },
      ],
    },
    isOpen: true,
    onSuccess: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    hooks.useApplicableCoupons.mockReturnValue({
      applicableCoupons: [{
        id: TEST_COUPON_ID,
        title: 'test-coupon',
        numUnassigned: 1,
        maxUses: 3,
      },
      {
        id: TEST_COUPON_ID_2,
        title: 'test-coupon-2',
        numUnassigned: 2,
        maxUses: 3,
      }],
      isLoading: false,
      error: undefined,
    });
  });

  it('should render skeleton if loading', () => {
    hooks.useApplicableCoupons.mockReturnValue({
      applicableCoupons: [],
      isLoading: true,
      error: undefined,
    });

    const { getByTestId } = render(
      <ApproveCouponCodeRequestModal {...basicProps} />,
    );

    expect(getByTestId('approve-coupon-code-request-modal-skeleton'));
  });

  it('should disable the approve button if no coupon code has been selected', () => {
    const { getByTestId } = render(
      <ApproveCouponCodeRequestModal {...basicProps} />,
    );

    const approveBtn = getByTestId('approve-coupon-code-request-modal-approve-btn');
    expect(approveBtn.disabled).toBe(true);
  });

  it('should auto select coupon and hide choices if there is only one applicable coupon', async () => {
    hooks.useApplicableCoupons.mockReturnValue({
      applicableCoupons: [{
        id: TEST_COUPON_ID,
        title: 'test-coupon',
        numUnassigned: 1,
        maxUses: 3,
      }],
      isLoading: false,
      error: undefined,
    });

    const { getByTestId, queryByTestId } = render(
      <ApproveCouponCodeRequestModal {...basicProps} />,
    );

    expect(queryByTestId('approve-coupon-code-request-modal-coupon-0')).toBeNull();
    const approveBtn = getByTestId('approve-coupon-code-request-modal-approve-btn');
    expect(approveBtn.disabled).toBe(false);

    await waitFor(() => {
      expect(approveBtn.disabled).toBe(false);
    });
  });

  it('should call Enterprise Access API to approve the request and call onSuccess afterwards', async () => {
    const handleSuccess = jest.fn();
    const { getByTestId } = render(
      <ApproveCouponCodeRequestModal {...basicProps} onSuccess={handleSuccess} />,
    );

    const couponChoiceRadio = getByTestId('approve-coupon-code-request-modal-coupon-0');
    userEvent.click(couponChoiceRadio);

    const approveBtn = getByTestId('approve-coupon-code-request-modal-approve-btn');
    expect(approveBtn.disabled).toBe(false);

    userEvent.click(approveBtn);

    await waitFor(() => {
      expect(EnterpriseAccessApiService.approveCouponCodeRequests).toHaveBeenCalledWith({
        enterpriseId: TEST_ENTERPRISE_UUID,
        couponCodeRequestUUIDs: [basicProps.couponCodeRequest.uuid],
        couponId: String(TEST_COUPON_ID),
      });
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('should render alert if an error occurred', async () => {
    EnterpriseAccessApiService.approveCouponCodeRequests.mockRejectedValue(new Error('something went wrong'));

    const { getByTestId } = render(
      <ApproveCouponCodeRequestModal {...basicProps} />,
    );

    const couponChoiceRadio = getByTestId('approve-coupon-code-request-modal-coupon-0');
    userEvent.click(couponChoiceRadio);

    let approveBtn = getByTestId('approve-coupon-code-request-modal-approve-btn');
    expect(approveBtn.disabled).toBe(false);

    userEvent.click(approveBtn);

    await waitFor(() => {
      expect(EnterpriseAccessApiService.approveCouponCodeRequests).toHaveBeenCalledWith({
        enterpriseId: TEST_ENTERPRISE_UUID,
        couponCodeRequestUUIDs: [basicProps.couponCodeRequest.uuid],
        couponId: String(TEST_COUPON_ID),
      });

      approveBtn = getByTestId('approve-coupon-code-request-modal-approve-btn');
      expect(getByTestId('approve-coupon-code-request-modal-error-alert'));
      expect(approveBtn.textContent).toBe('Try again');
    });
  });

  it('should render alert if there are no applicable coupons', async () => {
    hooks.useApplicableCoupons.mockReturnValue({
      applicableCoupons: [],
      isLoading: false,
      error: undefined,
    });

    const { getByTestId } = render(
      <ApproveCouponCodeRequestModal {...basicProps} />,
    );

    expect(getByTestId('approve-coupon-code-request-modal-no-coupons-alert'));
  });
});

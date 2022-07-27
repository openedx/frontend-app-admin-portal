import React from 'react';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import * as enterpriseUtils from '@edx/frontend-enterprise-utils';
import SubscriptionExpirationModals from '../../expiration/SubscriptionExpirationModals';
import { EXPIRED_MODAL_TITLE } from '../../expiration/SubscriptionExpiredModal';
import { EXPIRING_MODAL_TITLE } from '../../expiration/SubscriptionExpiringModal';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../../data/constants';
import {
  TEST_ENTERPRISE_CUSTOMER_UUID,
  SUBSCRIPTION_PLAN_ZERO_STATE,
  SubscriptionManagementContext,
} from '../TestUtilities';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

// PropType validation for state is done by SubscriptionManagementContext
// eslint-disable-next-line react/prop-types
function ExpirationModalsWithContext({ detailState }) {
  return (
    <SubscriptionManagementContext detailState={detailState}>
      <SubscriptionExpirationModals enterpriseId="fake-uuid" />
    </SubscriptionManagementContext>
  );
}

describe('<SubscriptionExpirationModals />', () => {
  afterEach(() => jest.clearAllMocks());

  describe('non-expired and non-expiring', () => {
    test('does not render any expiration modals', () => {
      render(<ExpirationModalsWithContext detailState={SUBSCRIPTION_PLAN_ZERO_STATE} />);
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeFalsy();
    });
  });

  describe('expired', () => {
    test('render expired modal', () => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration: 0,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeFalsy();
    });

    test('do not render expired modal when expiration notifications are disabled', () => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration: 0,
        showExpirationNotifications: false,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeFalsy();
    });

    test('expired modal is dismissible', () => {
      const agreementNetDaysUntilExpiration = 0;
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeTruthy();
      userEvent.click(screen.getByText('Dismiss'));
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeFalsy();
      expect(enterpriseUtils.sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        'edx.ui.admin_portal.subscriptions.expiration.modal.dismissed',
        {
          expiration_threshold: SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
          days_until_expiration: agreementNetDaysUntilExpiration,
        },
      );
    });

    test('handles support button click', () => {
      const agreementNetDaysUntilExpiration = 0;
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration,
      };

      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      userEvent.click(screen.getByText('Contact support'));
      expect(enterpriseUtils.sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        'edx.ui.admin_portal.subscriptions.expiration.modal.support_cta.clicked',
        {
          expiration_threshold: SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
          days_until_expiration: agreementNetDaysUntilExpiration,
        },
      );
    });
  });

  describe('expiring', () => {
    test.each([
      SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      SUBSCRIPTION_DAYS_REMAINING_SEVERE,
      SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    ])('render expiring modal for expiration threshold (%i days)', (threshold) => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration: threshold,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(`${threshold} days`, { exact: false })).toBeTruthy();
    });

    test('do not render expiring modal when expiration notifications are disabled', () => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration: SUBSCRIPTION_DAYS_REMAINING_SEVERE,
        showExpirationNotifications: false,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeFalsy();
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeFalsy();
    });

    test.each([
      SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      SUBSCRIPTION_DAYS_REMAINING_SEVERE,
      SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    ])('close expiring modal for expiration threshold (%i days)', async (threshold) => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration: threshold,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeTruthy();
      userEvent.click(screen.getByText('Dismiss'));
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeFalsy();
      expect(enterpriseUtils.sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        'edx.ui.admin_portal.subscriptions.expiration.modal.dismissed',
        {
          expiration_threshold: threshold,
          days_until_expiration: threshold,
        },
      );
    });

    test('handles support button click', () => {
      const agreementNetDaysUntilExpiration = 0;
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        agreementNetDaysUntilExpiration,
      };

      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      userEvent.click(screen.getByText('Contact support'));
      expect(enterpriseUtils.sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        'edx.ui.admin_portal.subscriptions.expiration.modal.support_cta.clicked',
        {
          expiration_threshold: SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
          days_until_expiration: agreementNetDaysUntilExpiration,
        },
      );
    });
  });
});

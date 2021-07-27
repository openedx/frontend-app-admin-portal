import React from 'react';
import {
  screen, render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import SubscriptionExpirationModals from '../../expiration/SubscriptionExpirationModals';
import { EXPIRED_MODAL_TITLE } from '../../expiration/SubscriptionExpiredModal';
import { EXPIRING_MODAL_TITLE } from '../../expiration/SubscriptionExpiringModal';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../../data/constants';
import {
  SUBSCRIPTION_PLAN_ZERO_STATE,
  SubscriptionManagementContext,
} from '../TestUtilities';

// PropType validation for state is done by SubscriptionManagementContext
// eslint-disable-next-line react/prop-types
const ExpirationModalsWithContext = ({ detailState }) => (
  <SubscriptionManagementContext detailState={detailState}>
    <SubscriptionExpirationModals enterpriseId="fake-uuid" />
  </SubscriptionManagementContext>
);

describe('<SubscriptionExpirationModals />', () => {
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
        daysUntilExpiration: 0,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeFalsy();
    });

    test('expired modal is dismissible', () => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        daysUntilExpiration: 0,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeTruthy();
      userEvent.click(screen.getByText('Dismiss'));
      expect(screen.queryByLabelText(EXPIRED_MODAL_TITLE)).toBeFalsy();
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
        daysUntilExpiration: threshold,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeTruthy();
      expect(screen.queryByText(`${threshold} days`, { exact: false })).toBeTruthy();
    });

    test.each([
      SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      SUBSCRIPTION_DAYS_REMAINING_SEVERE,
      SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    ])('close expiring modal for expiration threshold (%i days)', async (threshold) => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        daysUntilExpiration: threshold,
      };
      render(<ExpirationModalsWithContext detailState={detailStateCopy} />);
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeTruthy();
      userEvent.click(screen.getByText('Dismiss'));
      expect(screen.queryByLabelText(EXPIRING_MODAL_TITLE)).toBeFalsy();
    });
  });
});

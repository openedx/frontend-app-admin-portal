import {
  screen,
  cleanup,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import LicenseActions from '../../licenses/LicenseActions';
import {
  SubscriptionManagementContext, SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
} from '../TestUtilities';

describe('LicenseActions', () => {
  afterEach(() => {
    cleanup();
  });

  describe('activated license status', () => {
    const licensedUser = { status: 'activated' };

    it('should only render revoke button when subscription is not locked', () => {
      render(
        <SubscriptionManagementContext detailState={SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE}>
          <LicenseActions user={licensedUser} />
        </SubscriptionManagementContext>,
      );
      expect(screen.getByText('Revoke'));
      expect(screen.queryByText('Remind')).not.toBeInTheDocument();
    });

    it('should not render any buttons when subscription is locked', () => {
      render(
        <SubscriptionManagementContext
          detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            isLockedForRenewalProcessing: true,
          }}
        >
          <LicenseActions user={licensedUser} />
        </SubscriptionManagementContext>,
      );
      expect(screen.queryByText('Remind')).not.toBeInTheDocument();
      expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
    });
  });

  describe('assigned license status', () => {
    const licensedUser = { status: 'assigned' };

    it('should render both remind and revoke buttons when subscription is not locked', () => {
      render(
        <SubscriptionManagementContext detailState={SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE}>
          <LicenseActions user={licensedUser} />
        </SubscriptionManagementContext>,
      );
      expect(screen.getByText('Remind'));
      expect(screen.getByText('Revoke'));
    });

    it('should render only remind when subscription is locked', () => {
      render(
        <SubscriptionManagementContext
          detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            isLockedForRenewalProcessing: true,
          }}
        >
          <LicenseActions user={licensedUser} />
        </SubscriptionManagementContext>,
      );
      expect(screen.getByText('Remind'));
      expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
    });
  });

  describe('revoked license status', () => {
    const licensedUser = { status: 'revoked' };

    it('should render neither remind nor revoke buttons', () => {
      render(
        <SubscriptionManagementContext detailState={SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE}>
          <LicenseActions user={licensedUser} />
        </SubscriptionManagementContext>,
      );
      expect(screen.queryByText('Remind')).not.toBeInTheDocument();
      expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
    });
  });
});

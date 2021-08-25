import {
  screen,
  cleanup,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import { Provider } from 'react-redux';
import SubscriptionDetails from '../SubscriptionDetails';
import { TAB_PENDING_USERS } from '../data/constants';
import {
  createMockStore, SubscriptionManagementContext, SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
} from './TestUtilities';

import { SubscriptionContext } from '../SubscriptionData';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { ToastsContext } from '../../Toasts/ToastsProvider';

const defaultProps = {
  enterpriseSlug: 'sluggy',
};

const INVITE_LEARNERS_BUTTON_TEXT = 'Invite learners';

describe('SubscriptionDetails', () => {
  afterEach(() => {
    cleanup();
  });

  describe('invite learners button', () => {
    it('should be rendered if there are allocated licenses', () => {
      render(
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
          licenses: {
            allocated: 1,
            total: 1,
          },
        }}
        >
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT));
    });

    it('should be rendered if there are revoked licenses', () => {
      render(
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
          licenses: {
            allocated: 0,
            revoked: 1,
            total: 1,
          },
        }}
        >
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );

      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT));
    });

    it('should be rendered if the active tab is not on All Users', () => {
      render(
        <Provider store={createMockStore()}>
          <SubscriptionContext.Provider value={{ forceRefresh: jest.fn() }}>
            <SubscriptionDetailContext.Provider value={
                {
                  subscription: {
                    ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
                    licenses: {
                      allocated: 0,
                      total: 0,
                    },
                  },
                  activeTab: TAB_PENDING_USERS,
                }
              }
            >
              <ToastsContext.Provider value={{
                addToast: jest.fn(),
              }}
              >
                <SubscriptionDetails {...defaultProps} />
              </ToastsContext.Provider>
            </SubscriptionDetailContext.Provider>
          </SubscriptionContext.Provider>
        </Provider>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT));
    });

    it('should not be rendered if the subscription has expired', () => {
      render(
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
          daysUntilExpiration: 0,
        }}
        >
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );
      expect(screen.queryByText(INVITE_LEARNERS_BUTTON_TEXT)).not.toBeInTheDocument();
    });
  });
});

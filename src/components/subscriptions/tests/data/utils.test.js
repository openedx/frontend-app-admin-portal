import dayjs from 'dayjs';
import { ACTIVE, SCHEDULED, ENDED } from '../../data/constants';
import { sortSubscriptionsByStatus, getSubscriptionStatus } from '../../data/utils';

describe('utils', () => {
  const scheduledSub = {
    startDate: dayjs().add(1, 'days'),
    expirationDate: dayjs().add(10, 'days'),
  };
  const activeSub = {
    startDate: dayjs().subtract(1, 'days'),
    expirationDate: dayjs().add(10, 'days'),
  };
  const expiredSub = {
    startDate: dayjs().subtract(10, 'days'),
    expirationDate: dayjs().subtract(1, 'days'),
  };

  describe('getSubscriptionStatus', () => {
    it('should get the subscription plan status', () => {
      expect(getSubscriptionStatus(scheduledSub)).toEqual(SCHEDULED);
      expect(getSubscriptionStatus(activeSub)).toEqual(ACTIVE);
      expect(getSubscriptionStatus(expiredSub)).toEqual(ENDED);
    });
  });

  describe('sortSubscriptionsByStatus', () => {
    it('should sort subscriptions by status', () => {
      const initialOrder = [expiredSub, activeSub, scheduledSub];
      const expectedOrder = [activeSub, scheduledSub, expiredSub];

      expect(sortSubscriptionsByStatus(initialOrder)).toEqual(expectedOrder);
    });

    it('should sort subscriptions by start date after status', () => {
      const activeSub2 = {
        startDate: dayjs().subtract(2, 'days'),
        expirationDate: dayjs().add(10, 'days'),
      };
      const initialOrder = [expiredSub, activeSub, scheduledSub, activeSub2];
      const expectedOrder = [activeSub2, activeSub, scheduledSub, expiredSub];

      expect(sortSubscriptionsByStatus(initialOrder)).toEqual(expectedOrder);
    });
  });
});

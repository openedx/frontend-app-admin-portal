import dayjs from 'dayjs';
import { ACTIVE, SCHEDULED, ENDED } from '../../data/constants';
import { sortSubscriptionsByStatus, getSubscriptionStatus } from '../../data/utils';

describe('utils', () => {
  const scheduledSub = {
    startDate: dayjs().add(1, 'days').toISOString(),
    expirationDate: dayjs().add(10, 'days').toISOString(),
    title: 'Test Scheduled Plan',
  };
  const activeSub = {
    startDate: dayjs().subtract(1, 'days').toISOString(),
    expirationDate: dayjs().add(10, 'days').toISOString(),
    title: 'Test Active Plan',
  };
  const expiredSub = {
    startDate: dayjs().subtract(10, 'days').toISOString(),
    expirationDate: dayjs().subtract(1, 'days').toISOString(),
    title: 'Test Expired Plan',
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

    it('should sort subscriptions by expiration date after status', () => {
      const activeSub2 = {
        ...activeSub,
        expirationDate: dayjs().add(1, 'days').toISOString(), // expires sooner than other active subs plan
      };
      const initialOrder = [expiredSub, activeSub, scheduledSub, activeSub2];
      const expectedOrder = [activeSub2, activeSub, scheduledSub, expiredSub];
      expect(sortSubscriptionsByStatus(initialOrder)).toEqual(expectedOrder);
    });

    it('should sort subscriptions by plan title after status and date', () => {
      const activeSub2 = {
        ...activeSub,
        title: 'Another Active Plan', // title alphabetically comes before other active subs plan title
      };
      const initialOrder = [expiredSub, activeSub, scheduledSub, activeSub2];
      const expectedOrder = [activeSub2, activeSub, scheduledSub, expiredSub];
      expect(sortSubscriptionsByStatus(initialOrder)).toEqual(expectedOrder);
    });
  });
});

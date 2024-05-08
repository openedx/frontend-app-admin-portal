import { renderHook } from '@testing-library/react-hooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // Assuming this is the path to your expiryThresholds file
import useExpiry from './useExpiry';
import expiryThresholds from '../expiryThresholds';
import { formatDate } from '../../../learner-credit-management/data';

dayjs.extend(duration);

const modalOpen = jest.fn();
const modalClose = jest.fn();
const alertOpen = jest.fn();
const alertClose = jest.fn();

describe('useExpiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    (() => {
      const endDate = dayjs().add(120, 'day');
      return { endDate, expected: expiryThresholds[120]({ date: formatDate(endDate.toString()) }) };
    })(),
    (() => {
      const endDate = dayjs().add(90, 'day');
      return { endDate, expected: expiryThresholds[90]({ date: formatDate(endDate.toString()) }) };
    })(),
    (() => {
      const endDate = dayjs().add(60, 'day');
      return { endDate, expected: expiryThresholds[60]({ date: formatDate(endDate.toString()) }) };
    })(),
    (() => {
      const endDate = dayjs().add(30, 'day');
      return { endDate, expected: expiryThresholds[30]({ date: formatDate(endDate.toString()) }) };
    })(),
    (() => {
      const endDate = dayjs().add(10, 'day');
      const today = dayjs().add(1, 'minutes');
      const durationDiff = dayjs.duration(endDate.diff(today));

      return {
        endDate,
        expected: expiryThresholds[10]({
          date: formatDate(endDate.toString()),
          days: durationDiff.days(),
          hours: durationDiff.hours(),
        }),
      };
    })(),
    (() => {
      const endDate = dayjs().subtract(1, 'day');
      return { endDate, expected: expiryThresholds[0]({ date: formatDate(endDate.toString()) }) };
    })(),
  ])('displays correct notification and modal when plan is expiring in %s days', ({ endDate, expected }) => {
    const budgets = [{ end: endDate }]; // Mock data with an expiring budget

    const { result } = renderHook(() => useExpiry('enterpriseId', budgets, modalOpen, modalClose, alertOpen, alertClose));

    expect(result.current.notification).toEqual(expected.notificationTemplate);
    expect(result.current.modal).toEqual(expected.modalTemplate);
    expect(result.current.status).toEqual(expected.status);
  });

  it('displays no notification with both an expired and non-expired budget', () => {
    const expiredBudget = { end: dayjs().subtract(1, 'day') };
    const nonExpiredBudget = { end: dayjs().add(200, 'day') };
    const budgets = [expiredBudget, nonExpiredBudget];

    const { result } = renderHook(() => useExpiry('enterpriseId', budgets, modalOpen, modalClose, alertOpen, alertClose));

    expect(result.current.notification).toEqual(null);
    expect(result.current.modal).toEqual(null);
  });
});

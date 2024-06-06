import { renderHook } from '@testing-library/react-hooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration'; // Assuming this is the path to your expiryThresholds file
import { createIntl, IntlProvider } from '@edx/frontend-platform/i18n';
import useExpiry from './useExpiry';
import expiryThresholds from '../expiryThresholds';
import { formatDate } from '../../../learner-credit-management/data';

dayjs.extend(duration);

const modalOpen = jest.fn();
const modalClose = jest.fn();
const alertOpen = jest.fn();
const alertClose = jest.fn();

const offsetDays = {
  120: dayjs().add(120, 'day'),
  90: dayjs().add(90, 'day'),
  60: dayjs().add(60, 'day'),
  30: dayjs().add(30, 'day'),
  10: dayjs().add(10, 'day'),
  1: dayjs().subtract(1, 'day'),
};
const intl = createIntl({
  locale: 'en',
  messages: {},
});

describe('useExpiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const wrapper = ({ children }) => (
    <IntlProvider locale="en">
      {children}
    </IntlProvider>
  );
  it.each([
    {
      endDate: offsetDays['120'],
      expected: expiryThresholds[120]({
        intl,
        date: formatDate(offsetDays['120'].toString()),
      }),
      isNonExpiredBudget: true,
    },
    {
      endDate: offsetDays['90'],
      expected: expiryThresholds[90]({
        intl,
        date: formatDate(offsetDays['90'].toString()),
      }),
      isNonExpiredBudget: true,
    },
    {
      endDate: offsetDays['60'],
      expected: expiryThresholds[60]({
        intl,
        date: formatDate(offsetDays['60'].toString()),
      }),
      isNonExpiredBudget: true,
    },
    {
      endDate: offsetDays['30'],
      expected: expiryThresholds[30]({
        intl,
        date: formatDate(offsetDays['30'].toString()),
      }),
      isNonExpiredBudget: true,
    },
    {
      endDate: offsetDays['10'],
      expected: expiryThresholds[10]({
        intl,
        date: formatDate(offsetDays['10'].toString()),
        days: dayjs.duration(offsetDays['10'].diff(dayjs())).days(),
        hours: dayjs.duration(offsetDays['10'].diff(dayjs())).hours(),
      }),
      isNonExpiredBudget: true,
    },
    {
      endDate: offsetDays['1'],
      expected: expiryThresholds[0]({
        intl,
        date: formatDate(offsetDays['1'].toString()),
      }),
      isNonExpiredBudget: false,
    },
  ])('displays correct notification and modal when plan is expiring in %s days', ({ endDate, expected, isNonExpiredBudget }) => {
    const budgets = [{ end: endDate }]; // Mock data with an expiring budget
    const { result } = renderHook(() => useExpiry('enterpriseId', budgets, modalOpen, modalClose, alertOpen, alertClose), { wrapper });

    expect(result.current.notification).toEqual(expected.notificationTemplate);
    expect(result.current.modal).toEqual(expected.modalTemplate);
    expect(result.current.status).toEqual(expected.status);
    expect(result.current.isNonExpiredBudget).toEqual(isNonExpiredBudget);
  });

  it('displays no notification with both an expired and non-expired budget', () => {
    const expiredBudget = { end: dayjs().subtract(1, 'day') };
    const nonExpiredBudget = { end: dayjs().add(200, 'day') };
    const budgets = [expiredBudget, nonExpiredBudget];
    const { result } = renderHook(() => useExpiry('enterpriseId', budgets, modalOpen, modalClose, alertOpen, alertClose), { wrapper });

    expect(result.current.notification).toEqual(null);
    expect(result.current.modal).toEqual(null);
  });
});

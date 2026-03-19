import { renderHook, act } from '@testing-library/react';

import {
  useAdminsTabNotificationBubble,
  generateAdminsTabSeenCookieName,
} from '../AdminsTabNotificationBubble';

const seenCookieName = generateAdminsTabSeenCookieName();

describe('useAdminsTabNotificationBubble', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  it('should show bubble when seen cookie is not set', () => {
    const { result } = renderHook(() => useAdminsTabNotificationBubble());
    expect(result.current.adminsTabNotificationBubble).not.toBeNull();
  });

  it('should hide bubble when seen cookie is already set', () => {
    global.localStorage.setItem(seenCookieName, 'true');
    const { result } = renderHook(() => useAdminsTabNotificationBubble());
    expect(result.current.adminsTabNotificationBubble).toBeNull();
  });

  it('should hide bubble and set seen cookie when admins tab is clicked', () => {
    const { result } = renderHook(() => useAdminsTabNotificationBubble());
    act(() => {
      result.current.onAdminsTabClick();
    });

    expect(result.current.adminsTabNotificationBubble).toBeNull();
    expect(global.localStorage.getItem(seenCookieName)).toBe('true');
  });

  it('should remain hidden when admins tab clicked and already seen', () => {
    global.localStorage.setItem(seenCookieName, 'true');
    const { result } = renderHook(() => useAdminsTabNotificationBubble());
    act(() => {
      result.current.onAdminsTabClick();
    });

    expect(result.current.adminsTabNotificationBubble).toBeNull();
  });
});

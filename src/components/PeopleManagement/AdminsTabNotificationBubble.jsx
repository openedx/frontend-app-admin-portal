import { useState } from 'react';
import { Bubble } from '@openedx/paragon';

export const ADMINS_TAB_SEEN_COOKIE_PREFIX = 'admins-tab-seen';

export const generateAdminsTabSeenCookieName = () => ADMINS_TAB_SEEN_COOKIE_PREFIX;

const ADMINS_TAB_BUBBLE_STYLE = {
  minHeight: '0.5rem',
  minWidth: '0.5rem',
  top: -2,
  right: -8,
};

export const useAdminsTabNotificationBubble = () => {
  const seenCookieName = generateAdminsTabSeenCookieName();

  const [hasSeenAdminsTab, setHasSeenAdminsTab] = useState(
    () => Boolean(global.localStorage.getItem(seenCookieName)),
  );

  const onAdminsTabClick = () => {
    if (!hasSeenAdminsTab) {
      setHasSeenAdminsTab(true);
      global.localStorage.setItem(seenCookieName, 'true');
    }
  };

  const adminsTabNotificationBubble = !hasSeenAdminsTab ? (
    <Bubble
      variant="error"
      className="position-absolute"
      style={ADMINS_TAB_BUBBLE_STYLE}
    >
      <span className="sr-only">has unread notifications</span>
    </Bubble>
  ) : null;

  return {
    adminsTabNotificationBubble,
    onAdminsTabClick,
  };
};

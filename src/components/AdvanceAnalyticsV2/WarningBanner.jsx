import React, { useState } from 'react';
import Cookies from 'universal-cookie';
import {
  PageBanner,
} from '@openedx/paragon';
import { ANALYTICS_WARNING_BANNER_COOKIE } from './data/constants';

const WarningBanner = () => {
  const [showBanner, setShowBanner] = useState(true);
  const cookies = new Cookies();

  const onDismiss = () => {
    setShowBanner(false);
    cookies.set(ANALYTICS_WARNING_BANNER_COOKIE, true, { sameSite: 'strict' });
  };
  return (
    <PageBanner
      variant="warning"
      dismissible
      show={showBanner}
      onDismiss={onDismiss}
    >
      🚀 Analytics Just Got Better! We&apos;ve updated charts, improved performance,
      and now include audit enrollments for a more complete view of your data.
    </PageBanner>
  );
};

export default WarningBanner;

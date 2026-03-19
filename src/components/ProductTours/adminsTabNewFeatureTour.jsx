import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  TOUR_TARGETS,
  ADMINS_TAB_NEW_FEATURE_COOKIE_NAME,
  ADMINS_TAB_NEW_FEATURE_ADVANCE_EVENT_NAME,
  ADMINS_TAB_NEW_FEATURE_DISMISS_EVENT_NAME,
  ADMINS_TAB_NEW_FEATURE_ON_END_EVENT_NAME,
} from './constants';
import { disableAll } from './data/utils';

export const generateAdminsTabAlertCookieName = () => ADMINS_TAB_NEW_FEATURE_COOKIE_NAME;

const adminsTabNewFeatureTour = ({ enterpriseSlug }) => {
  const alertCookieName = generateAdminsTabAlertCookieName();

  const disableTour = () => {
    global.localStorage.setItem(alertCookieName, 'true');
  };

  const handleAdvanceTour = () => {
    disableTour();
    sendEnterpriseTrackEvent(enterpriseSlug, ADMINS_TAB_NEW_FEATURE_ADVANCE_EVENT_NAME);
  };

  const handleDismissTour = () => {
    disableTour();
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, ADMINS_TAB_NEW_FEATURE_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableTour();
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, ADMINS_TAB_NEW_FEATURE_ON_END_EVENT_NAME);
  };

  return {
    placement: 'right',
    body: "We've recently added the ability for you to invite and manage your admins.",
    target: `#${TOUR_TARGETS.PEOPLE_MANAGEMENT}`,
    title: 'New Feature',
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    dismissible: true,
    advanceButtonText: 'Next',
    endButtonText: 'Dismiss',
  };
};

adminsTabNewFeatureTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export const useAdminsTabNewFeatureTour = (enableInviteAdmins) => {
  const alertCookieName = generateAdminsTabAlertCookieName();
  return enableInviteAdmins && !global.localStorage.getItem(alertCookieName);
};

export default adminsTabNewFeatureTour;

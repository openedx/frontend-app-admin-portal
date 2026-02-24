import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';
import { intlShape } from '@edx/frontend-platform/i18n';

import {
  TOUR_TARGETS,
  ADMINS_TAB_NEW_FEATURE_COOKIE_NAME,
  ADMINS_TAB_NEW_FEATURE_ADVANCE_EVENT_NAME,
  ADMINS_TAB_NEW_FEATURE_DISMISS_EVENT_NAME,
  ADMINS_TAB_NEW_FEATURE_ON_END_EVENT_NAME,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

export const generateAdminsTabAlertCookieName = () => ADMINS_TAB_NEW_FEATURE_COOKIE_NAME;

const adminsTabNewFeatureTour = ({ enterpriseSlug, intl }) => {
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
    body: intl.formatMessage(messages.adminsTabNewFeatureTourBody),
    target: `#${TOUR_TARGETS.PEOPLE_MANAGEMENT}`,
    title: intl.formatMessage(messages.newFeatureTitle),
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    dismissible: true,
    advanceButtonText: intl.formatMessage(messages.newFeatureNextButton),
    endButtonText: intl.formatMessage(messages.newFeatureDismissButton),
  };
};

adminsTabNewFeatureTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export const useAdminsTabNewFeatureTour = (enableInviteAdmins) => {
  const alertCookieName = generateAdminsTabAlertCookieName();
  return enableInviteAdmins && !global.localStorage.getItem(alertCookieName);
};

export default adminsTabNewFeatureTour;

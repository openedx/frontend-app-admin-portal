import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';
import { intlShape } from '@edx/frontend-platform/i18n';

import {
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  PORTAL_APPEARANCE_ADVANCE_EVENT_NAME,
  PORTAL_APPEARANCE_DISMISS_EVENT_NAME,
  PORTAL_APPEARANCE_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

const portalAppearanceTour = ({
  enterpriseSlug,
  intl,
}) => {
  const disableTour = () => {
    global.localStorage.setItem(PORTAL_APPEARANCE_TOUR_COOKIE_NAME, true);
  };

  const handleAdvanceTour = () => {
    disableTour();
    sendEnterpriseTrackEvent(enterpriseSlug, PORTAL_APPEARANCE_ADVANCE_EVENT_NAME);
  };
  const handleDismissTour = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, PORTAL_APPEARANCE_DISMISS_EVENT_NAME);
  };
  const handleTourEnd = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, PORTAL_APPEARANCE_ON_END_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: intl.formatMessage(messages.portalAppearanceTourBody),
    target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
    title: intl.formatMessage(messages.newFeatureTitle),
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    advanceButtonText: intl.formatMessage(messages.newFeatureNextButton),
    endButtonText: intl.formatMessage(messages.newFeatureEndButton),
  };

  return tour;
};

portalAppearanceTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default portalAppearanceTour;

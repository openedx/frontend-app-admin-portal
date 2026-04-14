import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { intlShape } from '@edx/frontend-platform/i18n';

import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  BROWSE_AND_REQUEST_ADVANCE_EVENT_NAME,
  BROWSE_AND_REQUEST_DISMISS_EVENT_NAME,
  BROWSE_AND_REQUEST_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

const browseAndRequestTour = ({
  enterpriseSlug,
  intl,
}) => {
  const disableTour = () => {
    global.localStorage.setItem(BROWSE_AND_REQUEST_TOUR_COOKIE_NAME, true);
  };

  const handleAdvanceTour = () => {
    disableTour();
    sendEnterpriseTrackEvent(enterpriseSlug, BROWSE_AND_REQUEST_ADVANCE_EVENT_NAME);
  };

  const handleDismissTour = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, BROWSE_AND_REQUEST_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, BROWSE_AND_REQUEST_ON_END_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: intl.formatMessage(messages.browseAndRequestTourBody),
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

browseAndRequestTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default browseAndRequestTour;

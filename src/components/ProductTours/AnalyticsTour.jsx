import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  ANALYTICS_COOKIE_NAME,
  ANALYTICS_ADVANCE_EVENT_NAME,
  ANALYTICS_DISMISS_EVENT_NAME,
  ANALYTICS_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';

const analyticsTour = ({
  enterpriseSlug,
}) => {
  const disableTour = () => {
    global.localStorage.setItem(ANALYTICS_COOKIE_NAME, true);
  };

  const handleAdvanceTour = () => {
    disableTour();
    sendEnterpriseTrackEvent(enterpriseSlug, ANALYTICS_ADVANCE_EVENT_NAME);
  };

  const handleDismissTour = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, ANALYTICS_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, ANALYTICS_ON_END_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: 'We redesigned our Analytics page! Same tools, now with more control over your data.',
    target: `#${TOUR_TARGETS.ANALYTICS_SIDEBAR}`,
    title: 'New Feature',
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    advanceButtonText: 'Next',
    endButtonText: 'End',
  };

  return tour;
};

analyticsTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  tourEnabled: PropTypes.bool.isRequired,
};

export default analyticsTour;

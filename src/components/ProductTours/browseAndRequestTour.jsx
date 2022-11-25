import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  BROWSE_AND_REQUEST_ADVANCE_EVENT_NAME,
  BROWSE_AND_REQUEST_DISMISS_EVENT_NAME,
  BROWSE_AND_REQUEST_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';

const browseAndRequestTour = ({
  enterpriseSlug,
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
    body: "We've recently added a new feature that enables learners to browse for courses and request access. "
      + 'Continue to the settings page to learn more and configure access.',
    target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
    title: 'New Feature',
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
  };

  return tour;
};

browseAndRequestTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default browseAndRequestTour;

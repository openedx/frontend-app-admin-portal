import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import Cookies from 'universal-cookie';

import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { SETTINGS_TABS_VALUES } from '../settings/data/constants';
import {
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  BROWSE_AND_REQUEST_DISMISS_EVENT_NAME,
  BROWSE_AND_REQUEST_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';

const cookies = new Cookies();

const browseAndRequestTour = ({
  enterpriseSlug,
  tourEnabled,
  history,
  onDismiss,
  onEnd,
}) => {
  const disableTour = () => {
    cookies.set(
      BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
      true,
      { sameSite: 'strict' },
    );
  };

  const handleDismissTour = () => {
    disableTour();
    onDismiss();
    sendEnterpriseTrackEvent(enterpriseSlug, BROWSE_AND_REQUEST_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableTour();
    history.push({ pathname: `/${enterpriseSlug}/admin/${ROUTE_NAMES.settings}/${SETTINGS_TABS_VALUES.access}` });
    onEnd();
    sendEnterpriseTrackEvent(enterpriseSlug, BROWSE_AND_REQUEST_ON_END_EVENT_NAME);
  };

  const tour = {
    tourId: 'browseAndRequestTour',
    endButtonText: 'Continue To Settings',
    dismissButtonText: 'Dismiss',
    enabled: tourEnabled,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    checkpoints: [
      {
        placement: 'right',
        body: "We've recently added a new feature that enables learners to browse for courses and request access. "
          + 'Continue to the settings page to learn more and configure access.',
        target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
        title: 'New Feature',
        showDismissButton: true,
      },
    ],
  };

  return tour;
};

browseAndRequestTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  tourEnabled: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
};

export default browseAndRequestTour;

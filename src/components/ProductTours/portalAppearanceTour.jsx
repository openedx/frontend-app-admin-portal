import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import Cookies from 'universal-cookie';

import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { SETTINGS_TABS_VALUES } from '../settings/data/constants';
import {
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  PORTAL_APPEARANCE_DISMISS_EVENT_NAME,
  PORTAL_APPEARANCE_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';

const cookies = new Cookies();

const portalAppearanceTour = ({
  enterpriseSlug,
  tourEnabled,
  history,
  onDismiss,
  onEnd,
}) => {
  const disableTour = () => {
    cookies.set(
      PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
      true,
      { sameSite: 'strict' },
    );
  };

  const handleDismissTour = () => {
    disableTour();
    onDismiss();
    sendEnterpriseTrackEvent(enterpriseSlug, PORTAL_APPEARANCE_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableTour();
    history.push({ pathname: `/${enterpriseSlug}/admin/${ROUTE_NAMES.settings}/${SETTINGS_TABS_VALUES.appearance}` });
    onEnd();
    sendEnterpriseTrackEvent(enterpriseSlug, PORTAL_APPEARANCE_ON_END_EVENT_NAME);
  };

  const tour = {
    tourId: 'browseAndRequestTour',
    endButtonText: 'Portal Appearance',
    dismissButtonText: 'Dismiss',
    enabled: tourEnabled,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    checkpoints: [
      {
        placement: 'right',
        body: 'With the new Portal Appearance feature, you can now upload a logo or select custom or theme '
          + 'colors to align the look and feel of your Admin and Learner Portals with your brand. Continue to '
          + 'Portal Appearance under Settings to learn more.',
        target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
        title: 'New Feature',
        showDismissButton: true,
      },
    ],
  };

  return tour;
};

portalAppearanceTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  tourEnabled: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
};

export default portalAppearanceTour;

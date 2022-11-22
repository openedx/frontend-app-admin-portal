import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import Cookies from 'universal-cookie';

import {
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  PORTAL_APPEARANCE_ADVANCE_EVENT_NAME,
  PORTAL_APPEARANCE_DISMISS_EVENT_NAME,
  PORTAL_APPEARANCE_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { COOKIE_DISMISS_MAX_EXPIRY_DATE } from '../../data/constants';
import { disableAll } from './data/utils';

const cookies = new Cookies();

const portalAppearanceTour = ({
  enterpriseSlug,
}) => {
  const disableTour = () => {
    cookies.set(PORTAL_APPEARANCE_TOUR_COOKIE_NAME, true, { expires: COOKIE_DISMISS_MAX_EXPIRY_DATE });
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
    body: 'With the new Portal Appearance feature, you can now upload a logo or select custom or theme '
      + 'colors to align the look and feel of your Admin and Learner Portals with your brand. Continue to '
      + 'Portal Appearance under Settings to learn more.',
    target: `#${TOUR_TARGETS.SETTINGS_SIDEBAR}`,
    title: 'New Feature',
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
  };

  return tour;
};

portalAppearanceTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default portalAppearanceTour;

import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import Cookies from 'universal-cookie';

import {
  HIGHLIGHTS_COOKIE_NAME,
  HIGHLIGHTS_ADVANCE_EVENT_NAME,
  HIGHLIGHTS_DISMISS_EVENT_NAME,
  HIGHLIGHTS_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import disableAll from './data/utils';

const cookies = new Cookies();

const highlightsTour = ({
  enterpriseSlug,
}) => {
  const disableTour = () => {
    cookies.set(
      HIGHLIGHTS_COOKIE_NAME,
      true,
      { sameSite: 'strict' },
    );
  };

  const handleAdvanceTour = () => {
    disableTour();
    sendEnterpriseTrackEvent(enterpriseSlug, HIGHLIGHTS_ADVANCE_EVENT_NAME);
  };

  const handleDismissTour = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, HIGHLIGHTS_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, HIGHLIGHTS_ON_END_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: "We've recently added a Highlights feature that allows you to create and recommend course collections to your learners.",
    target: `#${TOUR_TARGETS.CONTENT_HIGHLIGHTS}`,
    title: 'New Feature',
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,

  };

  return tour;
};

highlightsTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  tourEnabled: PropTypes.bool.isRequired,
};

export default highlightsTour;

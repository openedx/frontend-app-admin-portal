import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';
import { intlShape } from '@edx/frontend-platform/i18n';

import {
  HIGHLIGHTS_COOKIE_NAME,
  HIGHLIGHTS_ADVANCE_EVENT_NAME,
  HIGHLIGHTS_DISMISS_EVENT_NAME,
  HIGHLIGHTS_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

const highlightsTour = ({
  enterpriseSlug,
  intl,
}) => {
  const disableTour = () => {
    global.localStorage.setItem(HIGHLIGHTS_COOKIE_NAME, true);
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
    body: intl.formatMessage(messages.highlightsTourBody),
    target: `#${TOUR_TARGETS.CONTENT_HIGHLIGHTS}`,
    title: intl.formatMessage(messages.newFeatureTitle),
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    advanceButtonText: intl.formatMessage(messages.newFeatureNextButton),
    endButtonText: intl.formatMessage(messages.newFeatureEndButton),
  };

  return tour;
};

highlightsTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default highlightsTour;

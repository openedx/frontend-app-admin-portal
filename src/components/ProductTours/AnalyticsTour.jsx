import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { intlShape } from '@edx/frontend-platform/i18n';

import {
  ANALYTICS_COOKIE_NAME,
  ANALYTICS_ADVANCE_EVENT_NAME,
  ANALYTICS_DISMISS_EVENT_NAME,
  ANALYTICS_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

const analyticsTour = ({
  enterpriseSlug,
  intl,
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
    body: intl.formatMessage(messages.analyticsTourBody),
    target: `#${TOUR_TARGETS.ANALYTICS_SIDEBAR}`,
    title: intl.formatMessage(messages.newFeatureTitle),
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    advanceButtonText: intl.formatMessage(messages.newFeatureNextButton),
    endButtonText: intl.formatMessage(messages.newFeatureEndButton),
  };

  return tour;
};

analyticsTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default analyticsTour;

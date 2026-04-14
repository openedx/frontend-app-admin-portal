import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { intlShape } from '@edx/frontend-platform/i18n';

import {
  LEARNER_CREDIT_COOKIE_NAME,
  LEARNER_CREDIT_ADVANCE_EVENT_NAME,
  LEARNER_CREDIT_DISMISS_EVENT_NAME,
  LEARNER_CREDIT_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

const learnerCreditTour = ({
  enterpriseSlug,
  intl,
}) => {
  const disableTour = () => {
    global.localStorage.setItem(LEARNER_CREDIT_COOKIE_NAME, true);
  };

  const handleAdvanceTour = () => {
    disableTour();
    sendEnterpriseTrackEvent(enterpriseSlug, LEARNER_CREDIT_ADVANCE_EVENT_NAME);
  };

  const handleDismissTour = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, LEARNER_CREDIT_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, LEARNER_CREDIT_ON_END_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: intl.formatMessage(messages.learnerCreditTourBody),
    target: `#${TOUR_TARGETS.LEARNER_CREDIT}`,
    title: intl.formatMessage(messages.newFeatureTitle),
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    advanceButtonText: intl.formatMessage(messages.newFeatureNextButton),
    endButtonText: intl.formatMessage(messages.newFeatureEndButton),
  };

  return tour;
};

learnerCreditTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default learnerCreditTour;

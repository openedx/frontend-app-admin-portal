import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  LEARNER_CREDIT_COOKIE_NAME,
  LEARNER_CREDIT_ADVANCE_EVENT_NAME,
  LEARNER_CREDIT_DISMISS_EVENT_NAME,
  LEARNER_CREDIT_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';

const learnerCreditTour = ({
  enterpriseSlug,
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
    body: "We've recently added a Learner Credit feature where you "
      + 'can review and manage your spend.',
    target: `#${TOUR_TARGETS.LEARNER_CREDIT}`,
    title: 'New Feature',
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
  };

  return tour;
};

learnerCreditTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default learnerCreditTour;

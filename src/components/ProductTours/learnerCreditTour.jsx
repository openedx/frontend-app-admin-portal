import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import Cookies from 'universal-cookie';

import {
  LEARNER_CREDIT_COOKIE_NAME,
  LEARNER_CREDIT_ADVANCE_EVENT_NAME,
  LEARNER_CREDIT_DISMISS_EVENT_NAME,
  LEARNER_CREDIT_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { COOKIE_DISMISS_MAX_EXPIRY_DATE } from '../../data/constants';
import { disableAll } from './data/utils';

const cookies = new Cookies();

const learnerCreditTour = ({
  enterpriseSlug,
}) => {
  const disableTour = () => {
    cookies.set(LEARNER_CREDIT_COOKIE_NAME, true, { expires: COOKIE_DISMISS_MAX_EXPIRY_DATE });
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

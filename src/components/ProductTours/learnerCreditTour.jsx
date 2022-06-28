import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import Cookies from 'universal-cookie';

import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import {
  LEARNER_CREDIT_COOKIE_NAME,
  LEARNER_CREDIT_DISMISS_EVENT_NAME,
  LEARNER_CREDIT_ON_END_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';

const cookies = new Cookies();

const learnerCreditTour = ({
  enterpriseSlug,
  tourEnabled,
  history,
  onDismiss,
  onEnd,
}) => {
  const disableTour = () => {
    cookies.set(
      LEARNER_CREDIT_COOKIE_NAME,
      true,
      { sameSite: 'strict' },
    );
  };

  const handleDismissTour = () => {
    disableTour();
    onDismiss();
    sendEnterpriseTrackEvent(enterpriseSlug, LEARNER_CREDIT_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableTour();
    history.push({ pathname: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}` });
    onEnd();
    sendEnterpriseTrackEvent(enterpriseSlug, LEARNER_CREDIT_ON_END_EVENT_NAME);
  };

  const tour = {
    tourId: 'learnerCreditTour',
    endButtonText: 'Continue To Learner Credit Page',
    dismissButtonText: 'Dismiss',
    enabled: tourEnabled,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    checkpoints: [
      {
        placement: 'right',
        body: "We've recently added a Learner Credit feature where you "
          + 'can review and manage your spend.',
        target: `#${TOUR_TARGETS.LEARNER_CREDIT}`,
        title: 'New Feature',
        showDismissButton: true,
      },
    ],
  };

  return tour;
};

learnerCreditTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  tourEnabled: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onEnd: PropTypes.func.isRequired,
};

export default learnerCreditTour;

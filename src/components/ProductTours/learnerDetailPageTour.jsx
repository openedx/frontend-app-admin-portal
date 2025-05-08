import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  LEARNER_DETAIL_PAGE_COOKIE_NAME,
  LEARNER_DETAIL_PAGE_DISMISS_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';

const learnerDetailPageTour = ({
  enterpriseSlug,
}) => {
  const handleDismissTour = () => {
    disableAll();
    global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
    sendEnterpriseTrackEvent(enterpriseSlug, LEARNER_DETAIL_PAGE_DISMISS_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: "With the new learner profile feature, you can view a learner's enrollments, budgets, and groups "
    + "all in one place. Access the learner profile by clicking on 'View more' on the People Management page.",
    target: `#${TOUR_TARGETS.PEOPLE_MANAGEMENT}`,
    title: 'New Feature',
    onDismiss: handleDismissTour,
    endButtonText: 'Dismiss',
  };

  return tour;
};

learnerDetailPageTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default learnerDetailPageTour;

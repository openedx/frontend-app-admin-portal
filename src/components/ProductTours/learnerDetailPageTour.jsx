import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { intlShape } from '@edx/frontend-platform/i18n';

import {
  LEARNER_DETAIL_PAGE_COOKIE_NAME,
  LEARNER_DETAIL_PAGE_DISMISS_EVENT_NAME,
  TOUR_TARGETS,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

const learnerDetailPageTour = ({
  enterpriseSlug,
  intl,
}) => {
  const handleDismissTour = () => {
    disableAll();
    global.localStorage.setItem(LEARNER_DETAIL_PAGE_COOKIE_NAME, true);
    sendEnterpriseTrackEvent(enterpriseSlug, LEARNER_DETAIL_PAGE_DISMISS_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: intl.formatMessage(messages.learnerDetailPageTourBody),
    target: `#${TOUR_TARGETS.PEOPLE_MANAGEMENT}`,
    title: intl.formatMessage(messages.newFeatureTitle),
    onDismiss: handleDismissTour,
    advanceButtonText: intl.formatMessage(messages.newFeatureNextButton),
    endButtonText: intl.formatMessage(messages.newFeatureDismissButton),
  };

  return tour;
};

learnerDetailPageTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default learnerDetailPageTour;

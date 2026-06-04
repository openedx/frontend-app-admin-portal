import React from 'react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';
import { FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';

import {
  LPR_UPDATE_COOKIE_NAME,
  LPR_UPDATE_ADVANCE_EVENT_NAME,
  LPR_UPDATE_DISMISS_EVENT_NAME,
  LPR_UPDATE_ON_END_EVENT_NAME,
} from './constants';
import { disableAll } from './data/utils';
import messages from './messages';

const lprUpdateTour = ({
  enterpriseSlug,
  intl,
}) => {
  const disableTour = () => {
    global.localStorage.setItem(LPR_UPDATE_COOKIE_NAME, true);
  };

  const handleAdvanceTour = () => {
    disableTour();
    sendEnterpriseTrackEvent(enterpriseSlug, LPR_UPDATE_ADVANCE_EVENT_NAME);
  };

  const handleDismissTour = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, LPR_UPDATE_DISMISS_EVENT_NAME);
  };

  const handleTourEnd = () => {
    disableAll();
    sendEnterpriseTrackEvent(enterpriseSlug, LPR_UPDATE_ON_END_EVENT_NAME);
  };

  const tour = {
    placement: 'right',
    body: (
      <FormattedMessage
        {...messages.lprUpdateTourBody}
        values={{
          boldPassDate: <span className="font-weight-bold">&apos;Pass Date&apos;</span>,
          boldProgressStatus: <span className="font-weight-bold">&apos;Progress Status&apos;</span>,
          boldCourseProgress: <span className="font-weight-bold">&apos;Course Progress&apos;</span>,
          boldCoursePassingGrade: <span className="font-weight-bold">&apos;Course Passing Grade&apos;</span>,
        }}
      />
    ),
    target: '#learner-progress-sidebar',
    title: intl.formatMessage(messages.lprUpdateTourTitle),
    onAdvance: handleAdvanceTour,
    onDismiss: handleDismissTour,
    onEnd: handleTourEnd,
    advanceButtonText: intl.formatMessage(messages.newFeatureNextButton),
    endButtonText: intl.formatMessage(messages.newFeatureEndButton),
  };

  return tour;
};

lprUpdateTour.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export const useLprUpdateTour = () => !global.localStorage.getItem(LPR_UPDATE_COOKIE_NAME);

export default lprUpdateTour;

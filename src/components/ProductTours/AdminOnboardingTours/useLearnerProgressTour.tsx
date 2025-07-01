import { ReactNode, useCallback, useState } from 'react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import {
  ADMIN_TOUR_EVENT_NAMES,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from './constants';

import messages from './messages';
import LmsApiService from '../../../data/services/LmsApiService';
import { flowUuids } from '../../../config';
import { TourStep } from '../types';

interface UseLearnerProgressTourProps {
  enterpriseSlug: string;
  adminUuid: string;
  aiButtonVisible: boolean;
}

const useLearnerProgressTour = (
  { enterpriseSlug, adminUuid, aiButtonVisible }: UseLearnerProgressTourProps,
): Array<TourStep> => {
  const intl = useIntl();
  const [stepIndex, setStepIndex] = useState(0);

  const handleAdvanceTour = useCallback(() => {
    const newIndex = stepIndex + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME, { 'completed-step': newIndex });
    setStepIndex(newIndex);
  }, [enterpriseSlug, stepIndex]);

  const handleEndTour = async () => {
    try {
      sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_COMPLETED_EVENT_NAME);
      await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuids.TRACK_LEARNER_PROGRESS_UUID);
    } catch (error) {
      logError(error);
    }
  };

  const tour: Array<TourStep> = [{
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.trackLearnerProgressStepOneTitle),
    body: intl.formatMessage(messages.trackLearnerProgressStepOneBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.trackLearnerProgressStepTwoBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepFourBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FULL_PROGRESS_REPORT}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepFiveBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FILTER}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepSixBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.CSV_DOWNLOAD}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepSevenBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepEightBody),
    onAdvance: handleEndTour,
  },
  ];

  if (aiButtonVisible) {
    tour.splice(2, 0, {
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.AI_SUMMARY}`,
      placement: 'right',
      body: intl.formatMessage(messages.trackLearnerProgressStepThreeBody),
      onAdvance: handleAdvanceTour,
    });
  }

  return tour;
};

export default useLearnerProgressTour;

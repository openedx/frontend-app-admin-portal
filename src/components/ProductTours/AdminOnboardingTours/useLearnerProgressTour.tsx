import { useCallback, useState } from 'react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ADMIN_TOUR_EVENT_NAMES,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from './constants';

import LmsApiService from '../../../data/services/LmsApiService';
import { flowUuids } from '../../../config';
import useCreateLearnerProgressFlow from './useCreateLearnerProgressFlow';
import useCreateAnalyticsFlow from './useCreateAnalyticsFlow';
import { TourStep } from '../types';

interface UseLearnerProgressTourProps {
  enterpriseSlug: string;
  adminUuid: string;
  aiButtonVisible: boolean;
  targetSelector?: string;
}

const useLearnerProgressTour = (
  {
    enterpriseSlug,
    adminUuid,
    aiButtonVisible,
    targetSelector,
  }: UseLearnerProgressTourProps,
): Array<TourStep> => {
  const [stepIndex, setStepIndex] = useState(0);

  const handleAdvanceTour = useCallback(() => {
    const newIndex = stepIndex + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME, { 'completed-step': newIndex });
    setStepIndex(newIndex);
  }, [enterpriseSlug, stepIndex]);

  const handleEndTour = async () => {
    try {
      sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME);
      await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuids.TRACK_LEARNER_PROGRESS_UUID);
    } catch (error) {
      logError(error);
    }
  };

  const learnerProgressFlow = useCreateLearnerProgressFlow({
    handleAdvanceTour,
    handleEndTour,
    aiButtonVisible,
  });

  const analyticsFlow = useCreateAnalyticsFlow({
    handleAdvanceTour,
    handleEndTour,
  });

  // Map target selectors to their respective flows
  const flowMapping = {
    // Learner progress flow targets
    [TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR]: learnerProgressFlow,
    // Analytics flow targets
    ...Object.fromEntries(
      Object.values(TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW)
        .map(target => [target, analyticsFlow]),
    ),
  };

  const selectedFlow = targetSelector ? flowMapping[targetSelector] : learnerProgressFlow;

  return selectedFlow || learnerProgressFlow;
};

export default useLearnerProgressTour;

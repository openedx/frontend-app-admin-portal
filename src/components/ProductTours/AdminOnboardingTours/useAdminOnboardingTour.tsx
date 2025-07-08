import { useCallback, useState } from 'react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ADMIN_TOUR_EVENT_NAMES,
  TRACK_LEARNER_PROGRESS_TARGETS,
  ANALYTICS_INSIGHTS_FLOW,
  ADMINISTER_SUBSCRIPTIONS_FLOW,
} from './constants';

import LmsApiService from '../../../data/services/LmsApiService';
import { flowUuids } from '../../../config';
import useCreateLearnerProgressFlow from './useCreateLearnerProgressFlow';
import useCreateAnalyticsFlow from './useCreateAnalyticsFlow';
import useAdministerSubscriptionsFlow from './useAdministerSubscriptionsFlow';
import { TourStep } from '../types';

interface UseAdminOnboardingTourProps {
  enterpriseSlug: string;
  adminUuid: string;
  aiButtonVisible: boolean;
  targetSelector?: string;
}

const useAdminOnboardingTour = (
  {
    enterpriseSlug,
    adminUuid,
    aiButtonVisible,
    targetSelector,
  }: UseAdminOnboardingTourProps,
): Array<TourStep> => {
  const [stepIndex, setStepIndex] = useState(0);

  const handleAdvanceTour = useCallback(() => {
    const manageLearnersButton = document.getElementById('manage-learners-button');
    if (manageLearnersButton && targetSelector === 'manage-learners-button') {
      manageLearnersButton.click();
      // Reset step index to 0 when navigating to detail page
      // The flow will change, so we need to start from the beginning
      setStepIndex(0);
      return;
    }
    const newIndex = stepIndex + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME, { 'completed-step': newIndex });
    setStepIndex(newIndex);
  }, [enterpriseSlug, stepIndex, targetSelector]);

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

  const administerSubscriptionsFlow = useAdministerSubscriptionsFlow({
    handleAdvanceTour,
    handleEndTour,
  });
  // Map target selectors to their respective flows
  const flowMapping = {
    // Learner progress flow targets
    [TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR]: learnerProgressFlow,
    // Analytics flow targets
    ...Object.fromEntries(
      Object.values(ANALYTICS_INSIGHTS_FLOW)
        .map(target => [target, analyticsFlow]),
    ),
    // Subscription flow targets - map to appropriate flow based on current page
    ...Object.fromEntries(
      Object.values(ADMINISTER_SUBSCRIPTIONS_FLOW)
        .map(target => [target, administerSubscriptionsFlow]),
    ),
  };

  const selectedFlow = targetSelector ? flowMapping[targetSelector] : learnerProgressFlow;

  return selectedFlow || learnerProgressFlow;
};

export default useAdminOnboardingTour;

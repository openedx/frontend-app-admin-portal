import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ANALYTICS_INSIGHTS_TARGETS,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from '../constants';

import LmsApiService from '../../../../data/services/LmsApiService';
import useCreateLearnerProgressFlow from './useCreateLearnerProgressFlow';
import useCreateAnalyticsFlow from './useCreateAnalyticsFlow';
import { TourStep } from '../../types';
import useCreateOrganizeLearnersFlow from './useCreateOrganizeLearnersFlow';

interface UseAdminOnboardingTourProps {
  adminUuid: string;
  aiButtonVisible: boolean;
  currentStep: number;
  setCurrentStep: (currentStep: number) => void;
  enterpriseSlug: string;
  targetSelector?: string;
}

const useAdminOnboardingTour = (
  {
    adminUuid, aiButtonVisible, currentStep, setCurrentStep, enterpriseSlug, targetSelector,
  }: UseAdminOnboardingTourProps,
): Array<TourStep> => {
  const handleAdvanceTour = (advanceEventName: string) => {
    const newIndex = currentStep + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
    setCurrentStep(newIndex);
  };

  const handleEndTour = async (endEventName: string, flowUuid: string) => {
    try {
      sendEnterpriseTrackEvent(enterpriseSlug, endEventName);
      await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuid);
    } catch (error) {
      logError(error);
    }
  };

  const analyticsFlow = useCreateAnalyticsFlow({ handleAdvanceTour, handleEndTour });
  const learnerProgressFlow = useCreateLearnerProgressFlow({ aiButtonVisible, handleAdvanceTour, handleEndTour });
  const organizeLearnersFlow = useCreateOrganizeLearnersFlow({ handleAdvanceTour, handleEndTour });

  // Map target selectors to their respective flows
  const flowMapping = {
    [TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR]: learnerProgressFlow,
    ...Object.fromEntries(
      Object.values(ANALYTICS_INSIGHTS_TARGETS)
        .map(target => [target, analyticsFlow]),
    ),
    ...Object.fromEntries(
      Object.values(ORGANIZE_LEARNER_TARGETS)
        .map(target => [target, organizeLearnersFlow]),
    ),
  };

  // we default to the first flow (learner progress)
  const selectedFlow = targetSelector ? flowMapping[targetSelector] : learnerProgressFlow;
  return selectedFlow || learnerProgressFlow;
};

export default useAdminOnboardingTour;

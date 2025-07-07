import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ANALYTICS_INSIGHTS_TARGETS,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from '../constants';

import { TourStep } from '../../types';
import LmsApiService from '../../../../data/services/LmsApiService';
import LearnerProgressFlow from './LearnerProgressFlow';
import AnalyticsFlow from './AnalyticsFlow';
import OrganizeLearnersFlow from './OrganizeLearnersFlow';

interface AdminOnboardingTourProps {
  adminUuid: string;
  aiButtonVisible: boolean;
  currentStep: number;
  setCurrentStep: (currentStep: number) => void;
  enterpriseSlug: string;
  targetSelector?: string;
}

const AdminOnboardingTour = (
  {
    adminUuid, aiButtonVisible, currentStep, setCurrentStep, enterpriseSlug, targetSelector,
  }: AdminOnboardingTourProps,
): Array<TourStep> => {
  function handleAdvanceTour(advanceEventName: string) {
    const newIndex = currentStep + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
    setCurrentStep(newIndex);
  }
  async function handleEndTour(endEventName: string, flowUuid: string) {
    try {
      sendEnterpriseTrackEvent(enterpriseSlug, endEventName);
      await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuid);
    } catch (error) {
      logError(error);
    }
  }
  const analyticsFlow = AnalyticsFlow({ handleAdvanceTour, handleEndTour });
  const learnerProgressFlow = LearnerProgressFlow({ aiButtonVisible, handleAdvanceTour, handleEndTour });
  const organizeLearnersFlow = OrganizeLearnersFlow({ handleAdvanceTour, handleEndTour });

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

export default AdminOnboardingTour;

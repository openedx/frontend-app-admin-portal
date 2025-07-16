import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ANALYTICS_INSIGHTS_TARGETS,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from '../constants';

import { TourStep } from '../../types';
import LmsApiService from '../../../../data/services/LmsApiService';
import AdministerSubscriptionsFlow from './AdministerSubscriptionsFlow';
import AnalyticsFlow from './AnalyticsFlow';
import LearnerProgressFlow from './LearnerProgressFlow';
import OrganizeLearnersFlow from './OrganizeLearnersFlow';

interface AdminOnboardingTourProps {
  adminUuid: string;
  aiButtonVisible: boolean;
  currentStep: number;
  enterpriseId: string;
  enterpriseSlug: string;
  onClose: () => void;
  setCurrentStep: (currentStep: number) => void;
  targetSelector?: string;
}

const AdminOnboardingTour = (
  {
    adminUuid, aiButtonVisible, currentStep, enterpriseId, enterpriseSlug, onClose, setCurrentStep, targetSelector,
  }: AdminOnboardingTourProps,
): Array<TourStep> => {
  function handleAdvanceTour(advanceEventName: string) {
    const newIndex = currentStep + 1;
    sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
    setCurrentStep(newIndex);
  }

  async function handleEndTour(endEventName: string, flowUuid: string) {
    try {
      onClose();
      sendEnterpriseTrackEvent(enterpriseSlug, endEventName);
      await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuid);
    } catch (error) {
      logError(error);
    }
  }

  const administerSubscriptionsFlow = AdministerSubscriptionsFlow({
    currentStep, enterpriseSlug, handleEndTour, setCurrentStep, targetSelector,
  });
  const analyticsFlow = AnalyticsFlow({ handleAdvanceTour, handleEndTour });
  const learnerProgressFlow = LearnerProgressFlow({ aiButtonVisible, handleAdvanceTour, handleEndTour });
  const organizeLearnersFlow = OrganizeLearnersFlow({
    currentStep, enterpriseId, enterpriseSlug, handleEndTour, setCurrentStep, targetSelector,
  });

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
    ...Object.fromEntries(
      Object.values(ADMINISTER_SUBSCRIPTIONS_TARGETS)
        .map(target => [target, administerSubscriptionsFlow]),
    ),
  };

  // we default to the first flow (learner progress)
  const selectedFlow = targetSelector ? flowMapping[targetSelector] : learnerProgressFlow;
  return selectedFlow || learnerProgressFlow;
};

export default AdminOnboardingTour;

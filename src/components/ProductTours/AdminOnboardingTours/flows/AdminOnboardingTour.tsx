import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ANALYTICS_INSIGHTS_TARGETS,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ALLOCATE_LEARNING_BUDGETS_TARGETS,
} from '../constants';

import { TourStep } from '../../types';
import LmsApiService from '../../../../data/services/LmsApiService';
import LearnerProgressFlow from './LearnerProgressFlow';
import AnalyticsFlow from './AnalyticsFlow';
import OrganizeLearnersFlow from './OrganizeLearnersFlow';
import AdministerSubscriptionsFlow from './AdministerSubscriptionsFlow';
import AllocateLearningBudgetsFlow from './AllocateLearningBudgetsFlow';

interface AdminOnboardingTourProps {
  adminUuid: string;
  aiButtonVisible: boolean;
  currentStep: number;
  setCurrentStep: (currentStep: number) => void;
  enterpriseSlug: string;
  onClose: () => void;
  targetSelector?: string;
  enablePortalLearnerCreditManagementScreen: boolean;
  enterpriseUUID: string;
  enterpriseFeatures: {
    topDownAssignmentRealTimeLcm: boolean;
  }
}

const AdminOnboardingTour = (
  {
    adminUuid,
    aiButtonVisible,
    currentStep,
    setCurrentStep,
    enterpriseSlug,
    onClose,
    targetSelector,
    enablePortalLearnerCreditManagementScreen,
    enterpriseUUID,
    enterpriseFeatures,
  }: AdminOnboardingTourProps,
): Array<TourStep> => {
  function handleAdvanceTour(advanceEventName: string) {
    const newIndex = currentStep + 1;

    const manageLearnersButton = document.getElementById('manage-learners-button');
    if (manageLearnersButton && targetSelector === 'manage-learners-button') {
      manageLearnersButton.click();
      setCurrentStep(0);
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
      return;
    }

    const viewBudgetButton = document.getElementById(ALLOCATE_LEARNING_BUDGETS_TARGETS.VIEW_BUDGET);
    if (viewBudgetButton && targetSelector === ALLOCATE_LEARNING_BUDGETS_TARGETS.VIEW_BUDGET) {
      viewBudgetButton.click();
      setCurrentStep(0);
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
      return;
    }

    const detailPageTargets = [
      ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTION_PLANS_DETAIL_PAGE,
      ADMINISTER_SUBSCRIPTIONS_TARGETS.INVITE_LEARNERS_BUTTON,
      ADMINISTER_SUBSCRIPTIONS_TARGETS.LICENSE_ALLOCATION_SECTION,
      ADMINISTER_SUBSCRIPTIONS_TARGETS.LICENSE_ALLOCATION_FILTERS,
      ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTIONS_NAVIGATION,
    ];

    if (detailPageTargets.includes(targetSelector as string)) {
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': 3 + newIndex });
    } else {
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
    }

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
  const analyticsFlow = AnalyticsFlow({ handleAdvanceTour, handleEndTour });
  const learnerProgressFlow = LearnerProgressFlow({ aiButtonVisible, handleAdvanceTour, handleEndTour });
  const organizeLearnersFlow = OrganizeLearnersFlow({ handleAdvanceTour, handleEndTour });
  const administerSubscriptionsFlow = AdministerSubscriptionsFlow({ handleAdvanceTour, handleEndTour });
  const allocateLearningBudgetsFlow = AllocateLearningBudgetsFlow({
    handleAdvanceTour,
    handleEndTour,
    enablePortalLearnerCreditManagementScreen,
    enterpriseUUID,
    enterpriseFeatures,
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
    ...Object.fromEntries(
      Object.values(ALLOCATE_LEARNING_BUDGETS_TARGETS)
        .map(target => [target, allocateLearningBudgetsFlow]),
    ),
  };

  // we default to the first flow (learner progress)
  const selectedFlow = targetSelector ? flowMapping[targetSelector] : learnerProgressFlow;
  return selectedFlow || learnerProgressFlow;
};

export default AdminOnboardingTour;

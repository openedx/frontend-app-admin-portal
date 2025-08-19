import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ANALYTICS_INSIGHTS_TARGETS,
  CUSTOMIZE_REPORTS_SIDEBAR,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
  ALLOCATE_LEARNING_BUDGETS_TARGETS,
} from '../constants';

import { TourStep } from '../../types';
import LmsApiService from '../../../../data/services/LmsApiService';
import AdministerSubscriptionsFlow from './AdministerSubscriptionsFlow';
import useAllocateLearningBudgetsFlow from './AllocateLearningBudgetsFlow';
import AnalyticsFlow from './AnalyticsFlow';
import CustomizeReportsFlow from './CustomizeReportsFlow';
import LearnerProgressFlow from './LearnerProgressFlow';
import OrganizeLearnersFlow from './OrganizeLearnersFlow';
import SetUpPreferencesFlow from './SetUpPreferencesFlow';
import { TOUR_TARGETS } from '../../constants';
import useFetchCompletedOnboardingFlows from '../data/useFetchCompletedOnboardingFlows';

interface AdminOnboardingTourProps {
  adminUuid: string;
  aiButtonVisible: boolean;
  currentStep: number;
  enterpriseId: string;
  enterpriseSlug: string;
  onClose: () => void;
  setCurrentStep: (currentStep: number) => void;
  targetSelector?: string;
  enablePortalLearnerCreditManagementScreen: boolean;
  enterpriseUUID: string;
  enterpriseFeatures: {
    topDownAssignmentRealTimeLcm: boolean;
  }
}

const AdminOnboardingTour = (
  {
    enablePortalLearnerCreditManagementScreen,
    enterpriseUUID,
    enterpriseFeatures,
    adminUuid,
    aiButtonVisible,
    currentStep,
    enterpriseSlug,
    onClose,
    setCurrentStep,
    targetSelector,
    enterpriseId,
  }: AdminOnboardingTourProps,
): Array<TourStep> => {
  const { refetch } = useFetchCompletedOnboardingFlows(adminUuid);
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

    sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
    setCurrentStep(newIndex);
  }

  function handleBackTour(backEventName: string) {
    const newIndex = currentStep - 1;
    sendEnterpriseTrackEvent(enterpriseSlug, backEventName, { 'back-step': newIndex });
    setCurrentStep(newIndex);
  }

  async function handleEndTour(endEventName: string, flowUuid: string) {
    try {
      onClose();
      sendEnterpriseTrackEvent(enterpriseSlug, endEventName);
      await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuid);
      refetch();
    } catch (error) {
      logError(error);
    }
  }

  const administerSubscriptionsFlow = AdministerSubscriptionsFlow({
    currentStep, enterpriseSlug, handleEndTour, handleBackTour, setCurrentStep, targetSelector,
  });
  const analyticsFlow = AnalyticsFlow({ handleAdvanceTour, handleBackTour, handleEndTour });
  const customizeReportsFlow = CustomizeReportsFlow({ handleEndTour });
  const learnerProgressFlow = LearnerProgressFlow({
    aiButtonVisible, handleAdvanceTour, handleBackTour, handleEndTour,
  });
  const organizeLearnersFlow = OrganizeLearnersFlow({
    enterpriseId, handleAdvanceTour, handleBackTour, handleEndTour,
  });
  const allocateLearningBudgetsFlow = useAllocateLearningBudgetsFlow({
    handleAdvanceTour,
    handleBackTour,
    handleEndTour,
    enablePortalLearnerCreditManagementScreen,
    enterpriseUUID,
    enterpriseFeatures,
  });
  const setUpPreferencesFlow = SetUpPreferencesFlow({ handleEndTour });

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
    // Customize reports flow target
    [CUSTOMIZE_REPORTS_SIDEBAR]: customizeReportsFlow,
    // Set up preferences flow target
    [TOUR_TARGETS.SETTINGS_SIDEBAR]: setUpPreferencesFlow,
  };

  // we default to the first flow (learner progress)
  const selectedFlow = targetSelector ? flowMapping[targetSelector] : learnerProgressFlow;
  return selectedFlow || learnerProgressFlow;
};

export default AdminOnboardingTour;

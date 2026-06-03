import { sendEnterpriseTrackEvent } from '@2uinc/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  CUSTOMIZE_REPORTS_SIDEBAR,
  EDIT_HIGHLIGHTS_TARGETS,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
  ALLOCATE_LEARNING_BUDGETS_TARGETS,
  ANALYTICS_V2_TARGETS,
} from '../constants';
import { TourStep } from '../../types';
import LmsApiService from '../../../../data/services/LmsApiService';
import AdministerSubscriptionsFlow from './AdministerSubscriptionsFlow';
import useAllocateLearningBudgetsFlow from './AllocateLearningBudgetsFlow';
import CustomizeReportsFlow from './CustomizeReportsFlow';
import EditHighlightsFlow from './EditHighlightsFlow';
import LearnerProgressFlow from './LearnerProgressFlow';
import AnalyticsV2Flow from './AnalyticsV2Flow';
import OrganizeLearnersFlow from './OrganizeLearnersFlow';
import SetUpPreferencesFlow from './SetUpPreferencesFlow';
import { TOUR_TARGETS } from '../../constants';
import useFetchCompletedOnboardingFlows from '../data/useFetchCompletedOnboardingFlows';

interface AdminOnboardingTourProps {
  adminUuid: string;
  currentStep: number;
  enablePortalLearnerCreditManagementScreen: boolean;
  enterpriseId: string;
  enterpriseSlug: string;
  onClose: () => void;
  setCurrentStep: (currentStep: number) => void;
  targetSelector?: string;
}

const AdminOnboardingTour = (
  {
    adminUuid,
    currentStep,
    enablePortalLearnerCreditManagementScreen,
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
      // Skip the completion POST when the flow UUID is not configured for this
      // environment to avoid sending an empty `flow_uuid` to the LMS.
      if (flowUuid) {
        await LmsApiService.updateCompletedTourFlows(adminUuid, flowUuid);
        refetch();
      }
    } catch (error) {
      logError(error);
    }
  }

  function handleDismissTour(dismissEventName: string) {
    sendEnterpriseTrackEvent(enterpriseSlug, dismissEventName);
    onClose();
  }

  const administerSubscriptionsFlow = AdministerSubscriptionsFlow({
    currentStep, enterpriseId, enterpriseSlug, handleEndTour, handleBackTour, setCurrentStep, targetSelector,
  });
  const analyticsV2Flow = AnalyticsV2Flow({
    handleAdvanceTour, handleBackTour, handleEndTour,
  });
  const customizeReportsFlow = CustomizeReportsFlow({ handleEndTour });
  const learnerProgressFlow = LearnerProgressFlow({
    handleAdvanceTour, handleBackTour, handleEndTour,
  });
  const organizeLearnersFlow = OrganizeLearnersFlow({
    enterpriseId,
    enableInviteAdmins: true,
    handleAdvanceTour,
    handleBackTour,
    handleEndTour,
  });
  const allocateLearningBudgetsFlow = useAllocateLearningBudgetsFlow({
    currentStep,
    enablePortalLearnerCreditManagementScreen,
    enterpriseId,
    enterpriseSlug,
    handleBackTour,
    handleEndTour,
    setCurrentStep,
    targetSelector,
  });
  const setUpPreferencesFlow = SetUpPreferencesFlow({ handleEndTour });
  const editHighlightsFlow = EditHighlightsFlow({
    handleAdvanceTour, handleBackTour, handleEndTour, handleDismissTour,
  });

  // Map target selectors to their respective flows
  const flowMapping = {
    [TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR]: learnerProgressFlow,
    ...Object.fromEntries(
      Object.values(ANALYTICS_V2_TARGETS)
        .map(target => [target, analyticsV2Flow]),
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
    ...Object.fromEntries(
      Object.values(EDIT_HIGHLIGHTS_TARGETS)
        .map(target => [target, editHighlightsFlow]),
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

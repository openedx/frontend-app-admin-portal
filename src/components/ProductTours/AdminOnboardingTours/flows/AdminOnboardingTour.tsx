import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { logError } from '@edx/frontend-platform/logging';

import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ANALYTICS_INSIGHTS_TARGETS,
  CUSTOMIZE_REPORTS_SIDEBAR,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from '../constants';

import { TourStep } from '../../types';
import LmsApiService from '../../../../data/services/LmsApiService';
import AdministerSubscriptionsFlow from './AdministerSubscriptionsFlow';
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
}

const AdminOnboardingTour = (
  {
    adminUuid, aiButtonVisible, currentStep, enterpriseId, enterpriseSlug, onClose, setCurrentStep, targetSelector,
  }: AdminOnboardingTourProps,
): Array<TourStep> => {
  const { refetch } = useFetchCompletedOnboardingFlows(adminUuid);
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
      refetch();
    } catch (error) {
      logError(error);
    }
  }

  const administerSubscriptionsFlow = AdministerSubscriptionsFlow({
    currentStep, enterpriseSlug, handleEndTour, setCurrentStep, targetSelector,
  });
  const analyticsFlow = AnalyticsFlow({ handleAdvanceTour, handleEndTour });
  const customizeReportsFlow = CustomizeReportsFlow({ handleEndTour });
  const learnerProgressFlow = LearnerProgressFlow({ aiButtonVisible, handleAdvanceTour, handleEndTour });
  const organizeLearnersFlow = OrganizeLearnersFlow({ enterpriseId, handleAdvanceTour, handleEndTour });
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

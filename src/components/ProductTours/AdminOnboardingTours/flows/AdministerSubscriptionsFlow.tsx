import { useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useParams } from 'react-router';

import { SubsidyRequestsContext } from '../../../subsidy-requests';
import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';
import { ADMINISTER_SUBSCRIPTIONS_TARGETS, ADMIN_TOUR_EVENT_NAMES } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { configuration } from '../../../../config';

interface CreateTourFlowsProps {
  currentStep: number;
  enterpriseSlug: string;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  handleBackTour: (backEventName: string) => void;
  setCurrentStep: (step: number) => void;
  targetSelector?: string;
}

const AdministerSubscriptionsFlow = ({
  currentStep,
  enterpriseSlug,
  handleEndTour,
  handleBackTour,
  setCurrentStep,
  targetSelector,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const params = useParams();
  const subscriptionUuid = params['*']?.split('/')[1];
  const isOnDetailPage = !!subscriptionUuid;

  const { subsidyRequestConfiguration } = useContext(SubsidyRequestsContext);
  const isSubsidyRequestsEnabled = subsidyRequestConfiguration?.subsidyRequestsEnabled;
  const subsidyType = subsidyRequestConfiguration?.subsidyType;
  const isRequestsTabShown = isSubsidyRequestsEnabled && subsidyType === SUPPORTED_SUBSIDY_TYPES.license;
  const onEnd = () => handleEndTour(
    ADMIN_TOUR_EVENT_NAMES.ADMINISTER_SUBSCRIPTIONS_COMPLETED_EVENT_NAME,
    configuration.ADMIN_ONBOARDING_UUIDS.FLOW_SUBSCRIPTIONS_UUID,
  );

  function handleAdvanceTour(advanceEventName: string) {
    const newIndex = currentStep + 1;

    const manageLearnersButton = document.getElementById(ADMINISTER_SUBSCRIPTIONS_TARGETS.MANAGE_LEARNERS_BUTTON);
    if (manageLearnersButton && targetSelector === ADMINISTER_SUBSCRIPTIONS_TARGETS.MANAGE_LEARNERS_BUTTON) {
      manageLearnersButton.click();
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

  const onAdvance = () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ADMINISTER_SUBSCRIPTIONS_ADVANCE_EVENT_NAME);
  const onBack = () => handleBackTour(ADMIN_TOUR_EVENT_NAMES.ADMINISTER_SUBSCRIPTIONS_BACK_EVENT_NAME);

  if (isOnDetailPage) {
    return [
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR}`,
        placement: 'right',
        title: intl.formatMessage(messages.administerSubscriptionsTitle),
        body: intl.formatMessage(messages.administerSubscriptionsStepOneBody),
        onAdvance,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTION_PLANS_DETAIL_PAGE}`,
        placement: 'top',
        body: intl.formatMessage(messages.administerSubscriptionsStepFourBody),
        onAdvance,
        onBack,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.INVITE_LEARNERS_BUTTON}`,
        placement: 'left',
        body: intl.formatMessage(messages.administerSubscriptionsStepFiveBody),
        onAdvance,
        onBack,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.LICENSE_ALLOCATION_SECTION}`,
        placement: 'top',
        body: intl.formatMessage(messages.administerSubscriptionsStepSixBody),
        onAdvance,
        onBack,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.LICENSE_ALLOCATION_FILTERS}`,
        placement: 'right',
        body: intl.formatMessage(messages.administerSubscriptionsStepSevenBody),
        onAdvance,
        onBack,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTIONS_NAVIGATION}`,
        placement: 'right',
        body: intl.formatMessage(messages.administerSubscriptionsStepEightBody),
        onBack,
        onEnd,
      },
    ];
  }

  // Main subscription page flow (steps 1-4)
  const mainPageFlow: Array<TourStep> = [
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR}`,
      placement: 'right',
      title: intl.formatMessage(messages.administerSubscriptionsTitle),
      body: intl.formatMessage(messages.administerSubscriptionsStepOneBody),
      onAdvance,
    },
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTION_PLANS_LIST}`,
      placement: 'top',
      body: intl.formatMessage(messages.administerSubscriptionsStepTwoBody),
      onAdvance,
      onBack,
    },
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.MANAGE_LEARNERS_BUTTON}`,
      placement: 'left',
      body: intl.formatMessage(messages.administerSubscriptionsStepThreeBody),
      onBack,
      onEnd: onAdvance,
    },
  ];

  if (isRequestsTabShown) {
    mainPageFlow.splice(2, 0, {
      target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.MANAGE_REQUESTS}`,
      placement: 'bottom',
      body: intl.formatMessage(messages.administerSubscriptionsStepNineBody),
      onAdvance,
      onBack,
    });
  }
  return mainPageFlow;
};

export default AdministerSubscriptionsFlow;

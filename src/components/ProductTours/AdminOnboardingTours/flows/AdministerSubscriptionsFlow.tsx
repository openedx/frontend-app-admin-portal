import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';
import { ADMINISTER_SUBSCRIPTIONS_TARGETS, ADMIN_TOUR_EVENT_NAMES } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';

interface CreateTourFlowsProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const AdministerSubscriptionsFlow = ({
  handleAdvanceTour,
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const params = useParams();
  const onAnalyticsAdvance = () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME);

  const subscriptionUuid = params['*']?.split('/')[1];
  const isOnDetailPage = !!subscriptionUuid;

  if (isOnDetailPage) {
    return [
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTION_PLANS_DETAIL_PAGE}`,
        placement: 'top',
        body: intl.formatMessage(messages.administerSubscriptionsStepFourBody),
        onAdvance: onAnalyticsAdvance,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.INVITE_LEARNERS_BUTTON}`,
        placement: 'left',
        body: intl.formatMessage(messages.administerSubscriptionsStepFiveBody),
        onAdvance: onAnalyticsAdvance,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.LICENSE_ALLOCATION_SECTION}`,
        placement: 'top',
        body: intl.formatMessage(messages.administerSubscriptionsStepSixBody),
        onAdvance: onAnalyticsAdvance,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.LICENSE_ALLOCATION_FILTERS}`,
        placement: 'right',
        body: intl.formatMessage(messages.administerSubscriptionsStepSevenBody),
        onAdvance: onAnalyticsAdvance,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTIONS_NAVIGATION}`,
        placement: 'right',
        body: intl.formatMessage(messages.administerSubscriptionsStepEightBody),
        onAdvance: handleEndTour,
      },
    ];
  }

  // Main subscription page flow (steps 1-3)
  return [
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR}`,
      placement: 'right',
      title: intl.formatMessage(messages.administerSubscriptionsTitle),
      body: intl.formatMessage(messages.administerSubscriptionsStepOneBody),
      onAdvance: onAnalyticsAdvance,
    },
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.SUBSCRIPTION_PLANS_LIST}`,
      placement: 'top',
      body: intl.formatMessage(messages.administerSubscriptionsStepTwoBody),
      onAdvance: onAnalyticsAdvance,
    },
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_TARGETS.MANAGE_LEARNERS_BUTTON}`,
      placement: 'left',
      body: intl.formatMessage(messages.administerSubscriptionsStepThreeBody),
      onEnd: onAnalyticsAdvance,
    },
  ];
};

export default AdministerSubscriptionsFlow;

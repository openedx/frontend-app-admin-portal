import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';
import { ADMINISTER_SUBSCRIPTIONS_FLOW } from './constants';
import messages from './messages';
import { TourStep } from '../types';

interface CreateTourFlowsProps {
  handleAdvanceTour: () => void;
  handleEndTour: () => void;
}

const useAdministerSubscriptionsFlow = ({
  handleAdvanceTour,
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const params = useParams();

  const subscriptionUuid = params['*']?.split('/')[1];
  const isOnDetailPage = !!subscriptionUuid;

  if (isOnDetailPage) {
    return [
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_FLOW.SUBSCRIPTION_PLANS_DETAIL_PAGE}`,
        placement: 'top',
        body: intl.formatMessage(messages.administerSubscriptionsStepFourBody),
        onAdvance: handleAdvanceTour,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_FLOW.INVITE_LEARNERS_BUTTON}`,
        placement: 'left',
        body: intl.formatMessage(messages.administerSubscriptionsStepFiveBody),
        onAdvance: handleAdvanceTour,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_FLOW.LICENSE_ALLOCATION_SECTION}`,
        placement: 'top',
        body: intl.formatMessage(messages.administerSubscriptionsStepSixBody),
        onAdvance: handleAdvanceTour,
      },
      {
        target: `.${ADMINISTER_SUBSCRIPTIONS_FLOW.LICENSE_ALLOCATION_FILTERS}`,
        placement: 'right',
        body: intl.formatMessage(messages.administerSubscriptionsStepSevenBody),
        onAdvance: handleAdvanceTour,
      },
      {
        target: `#${ADMINISTER_SUBSCRIPTIONS_FLOW.SUBSCRIPTIONS_NAVIGATION}`,
        placement: 'right',
        body: intl.formatMessage(messages.administerSubscriptionsStepEightBody),
        onAdvance: handleEndTour,
      },
    ];
  }

  // Main subscription page flow (steps 1-3)
  return [
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_FLOW.SIDEBAR}`,
      placement: 'right',
      title: intl.formatMessage(messages.administerSubscriptionsTitle),
      body: intl.formatMessage(messages.administerSubscriptionsStepOneBody),
      onAdvance: handleAdvanceTour,
    },
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_FLOW.SUBSCRIPTION_PLANS_LIST}`,
      placement: 'top',
      body: intl.formatMessage(messages.administerSubscriptionsStepTwoBody),
      onAdvance: handleAdvanceTour,
    },
    {
      target: `#${ADMINISTER_SUBSCRIPTIONS_FLOW.MANAGE_LEARNERS_BUTTON}`,
      placement: 'left',
      body: intl.formatMessage(messages.administerSubscriptionsStepThreeBody),
      onEnd: handleAdvanceTour,
    },
  ];
};

export default useAdministerSubscriptionsFlow;

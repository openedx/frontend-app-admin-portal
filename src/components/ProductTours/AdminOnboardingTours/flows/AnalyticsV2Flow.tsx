import { useIntl } from '@edx/frontend-platform/i18n';
import { ANALYTICS_V2_TARGETS, ADMIN_TOUR_EVENT_NAMES } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { configuration } from '../../../../config';

interface CreateTourFlowsProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  handleBackTour: (backEventName: string) => void;
}

const AnalyticsV2Flow = ({
  handleAdvanceTour,
  handleEndTour,
  handleBackTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const onLearnerAdvance = () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ANALYTICS_ADVANCE_EVENT_NAME);
  const onLearnerBack = () => handleBackTour(ADMIN_TOUR_EVENT_NAMES.ANALYTICS_BACK_EVENT_NAME);

  const analyticsV2Flow: Array<TourStep> = [{
    target: `#${ANALYTICS_V2_TARGETS.SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.analyticsStepOneTitle),
    body: intl.formatMessage(messages.analyticsStepOneBody),
    onAdvance: onLearnerAdvance,
  }, {
    target: `#${ANALYTICS_V2_TARGETS.ENGAGEMENTS_TAB}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.analyticsStepTwoBody),
    onAdvance: onLearnerAdvance,
    onBack: onLearnerBack,
  }, {
    target: `#${ANALYTICS_V2_TARGETS.PROGRESS_TAB}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.analyticsStepThreeBody),
    onAdvance: onLearnerAdvance,
    onBack: onLearnerBack,
  }, {
    target: `#${ANALYTICS_V2_TARGETS.OUTCOMES_TAB}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.analyticsStepFourBody),
    onAdvance: onLearnerAdvance,
    onBack: onLearnerBack,
    onEnd: () => handleEndTour(
      ADMIN_TOUR_EVENT_NAMES.ANALYTICS_COMPLETED_EVENT_NAME,
      configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ANALYTICS_UUID,
    ),
  }];

  return analyticsV2Flow;
};

export default AnalyticsV2Flow;

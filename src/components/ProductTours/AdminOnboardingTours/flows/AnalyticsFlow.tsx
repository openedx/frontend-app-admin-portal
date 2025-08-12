import { useIntl } from '@edx/frontend-platform/i18n';
import { ADMIN_TOUR_EVENT_NAMES, ANALYTICS_INSIGHTS_TARGETS } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { configuration } from '../../../../config';

interface CreateTourFlowsProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  handleBackTour: (backEventName: string) => void;
}

const AnalyticsFlow = ({
  handleAdvanceTour,
  handleEndTour,
  handleBackTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const onAnalyticsAdvance = () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME);
  const onAnalyticsBack = () => handleBackTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_BACK_EVENT_NAME);

  return [{
    target: `#${ANALYTICS_INSIGHTS_TARGETS.SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.viewEnrollmentInsights),
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepOneBody),
    onAdvance: onAnalyticsAdvance,
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.DATE_RANGE}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepTwoBody),
    onAdvance: onAnalyticsAdvance,
    onBack: onAnalyticsBack,
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.METRICS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepThreeBody),
    onAdvance: onAnalyticsAdvance,
    onBack: onAnalyticsBack,
  }, {
    target: `.${ANALYTICS_INSIGHTS_TARGETS.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFourBody),
    onAdvance: onAnalyticsAdvance,
    onBack: onAnalyticsBack,
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.LEADERBOARD}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFiveBody),
    onAdvance: onAnalyticsAdvance,
    onBack: onAnalyticsBack,
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.SKILLS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepSixBody),
    onBack: onAnalyticsBack,
    onEnd: () => handleEndTour(
      ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_COMPLETED_EVENT_NAME,
      configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ENROLLMENT_INSIGHTS,
    ),
  }];
};

export default AnalyticsFlow;

import { useIntl } from '@edx/frontend-platform/i18n';
import { ANALYTICS_INSIGHTS_FLOW } from './constants';
import messages from './messages';
import { TourStep } from '../types';

interface CreateTourFlowsProps {
  handleAdvanceTour: () => void;
  handleEndTour: () => void;
}

const useCreateAnalyticsFlow = ({
  handleAdvanceTour,
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  return [{
    target: `#${ANALYTICS_INSIGHTS_FLOW.SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.viewEnrollmentInsights),
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepOneBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${ANALYTICS_INSIGHTS_FLOW.DATE_RANGE}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepTwoBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${ANALYTICS_INSIGHTS_FLOW.METRICS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepThreeBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `.${ANALYTICS_INSIGHTS_FLOW.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFourBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${ANALYTICS_INSIGHTS_FLOW.LEADERBOARD}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFiveBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${ANALYTICS_INSIGHTS_FLOW.SKILLS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepSixBody),
    onAdvance: handleEndTour,
  }];
};

export default useCreateAnalyticsFlow;

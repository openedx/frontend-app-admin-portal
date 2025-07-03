import { useIntl } from '@edx/frontend-platform/i18n';
import { ADMIN_TOUR_EVENT_NAMES, ANALYTICS_INSIGHTS_TARGETS } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { flowUuids } from '../../../../config';

interface CreateTourFlowsProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const useCreateAnalyticsFlow = ({
  handleAdvanceTour,
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  return [{
    target: `#${ANALYTICS_INSIGHTS_TARGETS.SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.viewEnrollmentInsights),
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepOneBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.DATE_RANGE}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepTwoBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.METRICS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepThreeBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME),
  }, {
    target: `.${ANALYTICS_INSIGHTS_TARGETS.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFourBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.LEADERBOARD}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFiveBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${ANALYTICS_INSIGHTS_TARGETS.SKILLS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepSixBody),
    onAdvance: () => handleEndTour(
      ADMIN_TOUR_EVENT_NAMES.ENROLLMENT_INSIGHTS_COMPLETED_EVENT_NAME,
      flowUuids.ENROLLMENT_INSIGHTS_UUID,
    ),
  }];
};

export default useCreateAnalyticsFlow;

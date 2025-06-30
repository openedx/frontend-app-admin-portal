import { ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { TRACK_LEARNER_PROGRESS_TARGETS } from './constants';
import messages from './messages';

interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title?: ReactNode;
  body: ReactNode;
  onAdvance: () => void;
}

interface CreateTourFlowsProps {
  handleAdvanceTour: () => void;
  handleEndTour: () => void;
  aiButtonVisible: boolean;
}

export const useCreateLearnerProgressFlow = ({
  handleAdvanceTour,
  handleEndTour,
  aiButtonVisible,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  const learnerProgressFlow: Array<TourStep> = [{
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.trackLearnerProgressStepOneTitle),
    body: intl.formatMessage(messages.trackLearnerProgressStepOneBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.trackLearnerProgressStepTwoBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepFourBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FULL_PROGRESS_REPORT}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepFiveBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FILTER}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepSixBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.CSV_DOWNLOAD}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepSevenBody),
    onAdvance: handleAdvanceTour,
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepEightBody),
    onAdvance: handleEndTour,
  }];

  if (aiButtonVisible) {
    learnerProgressFlow.splice(2, 0, {
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.AI_SUMMARY}`,
      placement: 'right',
      body: intl.formatMessage(messages.trackLearnerProgressStepThreeBody),
      onAdvance: handleAdvanceTour,
    });
  }

  return learnerProgressFlow;
};

export const useCreateAnalyticsFlow = ({
  handleAdvanceTour,
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  return [{
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.viewEnrollmentInsights),
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepOneBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.DATE_RANGE}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepTwoBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.METRICS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepThreeBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `.${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFourBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.LEADERBOARD}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepFiveBody),
    onAdvance: handleAdvanceTour,
  },
  {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.SKILLS}`,
    placement: 'top',
    body: intl.formatMessage(messages.viewEnrollmentInsightsStepSixBody),
    onAdvance: handleEndTour,
  }];
};

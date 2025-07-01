import { useIntl } from '@edx/frontend-platform/i18n';
import { TRACK_LEARNER_PROGRESS_TARGETS } from './constants';
import messages from './messages';
import { TourStep } from '../types';

interface CreateTourFlowsProps {
  handleAdvanceTour: () => void;
  handleEndTour: () => void;
  aiButtonVisible?: boolean;
}

const useCreateLearnerProgressFlow = ({
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

export default useCreateLearnerProgressFlow;

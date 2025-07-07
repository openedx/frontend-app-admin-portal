import { useIntl } from '@edx/frontend-platform/i18n';
import { TRACK_LEARNER_PROGRESS_TARGETS, ADMIN_TOUR_EVENT_NAMES } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { configuration } from '../../../../config';

interface CreateTourFlowsProps {
  aiButtonVisible?: boolean;
  handleAdvanceTour: (advanceEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
}

const LearnerProgressFlow = ({
  aiButtonVisible,
  handleAdvanceTour,
  handleEndTour,
}: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();

  const learnerProgressFlow: Array<TourStep> = [{
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.trackLearnerProgressStepOneTitle),
    body: intl.formatMessage(messages.trackLearnerProgressStepOneBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}`,
    placement: 'bottom',
    body: intl.formatMessage(messages.trackLearnerProgressStepTwoBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepFourBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FULL_PROGRESS_REPORT}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepFiveBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FILTER}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepSixBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.CSV_DOWNLOAD}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepSevenBody),
    onAdvance: () => handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME),
  }, {
    target: `#${TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}`,
    placement: 'top',
    body: intl.formatMessage(messages.trackLearnerProgressStepEightBody),
    onEnd: () => handleEndTour(
      ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_COMPLETED_EVENT_NAME,
      configuration.ADMIN_ONBOARDING_UUIDS.FLOW_TRACK_LEARNER_PROGRESS_UUID,
    ),
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

export default LearnerProgressFlow;

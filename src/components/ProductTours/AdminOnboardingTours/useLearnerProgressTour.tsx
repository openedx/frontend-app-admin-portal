import { ReactNode, useState } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import {
  ADMIN_TOUR_EVENT_NAMES,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from './constants';

import messages from '../messages';

interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title?: ReactNode;
  body: ReactNode;
  onAdvance: () => void;
}

interface UseLearnerProgressTourProps {
  enterpriseSlug: string;
  setTarget: Function;
  aiButtonVisible: boolean;
}

const useLearnerProgressTour = ({ enterpriseSlug, setTarget, aiButtonVisible }: UseLearnerProgressTourProps): Array<TourStep> => {
  const [tourIndex, setTourIndex] = useState(0);
  const navigate = useNavigate();

  // const handleAdvanceToModuleActivity = () => {
  //   // click to module activity tab
  //   navigate(`/${enterpriseSlug}/admin/${ROUTE_NAMES.learners}/#moduleactivity`);
  //   handleAdvanceTour();
  // };

  const handleAdvanceTour = () => {
    const newIndex = tourIndex + 1;
    // setTourIndex(newIndex)
    // console.log(tour[tourIndex]);
    // console.log(tour[tourIndex + 1])
    // setTarget(tour[newIndex].target);
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME);
  };

  const intl = useIntl();

  const tour: Array<TourStep> = [{
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
    onAdvance: handleAdvanceTour,
  },
  ];

  if (aiButtonVisible) {
    tour.splice(2, 0, {
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.AI_SUMMARY}`,
      placement: 'right',
      body: intl.formatMessage(messages.trackLearnerProgressStepThreeBody),
      onAdvance: handleAdvanceTour,
    });
  }

  return tour;
};

export default useLearnerProgressTour;

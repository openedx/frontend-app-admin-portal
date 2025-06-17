import { ReactNode } from 'react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useIntl } from '@edx/frontend-platform/i18n';

import {
  ADMIN_TOUR_EVENT_NAMES,
  ADMIN_TOUR_TARGETS,
} from './constants';

import messages from './messages';

interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title: ReactNode;
  body: ReactNode;
  onAdvance: () => void;
}

interface UseLearnerProgressTourProps {
  enterpriseSlug: string;
}

const useLearnerProgressTour = ({ enterpriseSlug }: UseLearnerProgressTourProps): TourStep => {
  // TO-DO: Handle in next ticket
  const handleAdvanceTour = () => {
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME);
  };
  const intl = useIntl();

  const tour: TourStep = {
    target: `#${ADMIN_TOUR_TARGETS.LEARNER_PROGRESS_SIDEBAR}`,
    placement: 'right',
    title: intl.formatMessage(messages.trackLearnerProgressStepOneTitle),
    body: intl.formatMessage(messages.trackLearnerProgressStepOneBody),
    onAdvance: handleAdvanceTour,
  };

  return tour;
};

export default useLearnerProgressTour;

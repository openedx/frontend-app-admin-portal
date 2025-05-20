import { ReactNode } from 'react';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import {
  ADMIN_TOUR_EVENT_NAMES,
  ADMIN_TOUR_TARGETS
} from '../AdminOnboardingTours/constants';

interface TourStep {
  target: string;
  placement: 'right' | 'left' | 'top' | 'bottom';
  title: ReactNode;
  body: ReactNode;
  onAdvance: () => void;
}

interface LearnerProgressTourProps {
  enterpriseSlug: string;
}

const learnerProgressTour = ({
  enterpriseSlug,
}: LearnerProgressTourProps): TourStep => {
  // Handle in next ticket
  const handleAdvanceTour = () => {
    sendEnterpriseTrackEvent(enterpriseSlug, ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME);
  };

  const tour: TourStep = {
    target: `#${ADMIN_TOUR_TARGETS.LEARNER_PROGRESS_SIDEBAR}`,
    placement: 'right',
    title: (
      <FormattedMessage
        id="adminPortal.productTours.adminOnboarding.trackLearnerProgress.title"
        defaultMessage="Track Learner Progress"
        description="Title for the learner progress tracking step"
      />
    ),
    body: (
      <FormattedMessage
        id="adminPortal.productTours.adminOnboarding.trackLearnerProgress.body"
        defaultMessage="Track learner activity and progress across courses with the Learner Progress Report."
        description="Description for the learner progress tracking step"
      />
    ),
    onAdvance: handleAdvanceTour,
  };

  return tour;
};

export default learnerProgressTour; 
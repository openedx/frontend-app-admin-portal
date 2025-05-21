import React, { FC, useState } from 'react';
import { connect } from 'react-redux';

import {
  IconButton, Icon, OverlayTrigger, Tooltip, Stack,
} from '@openedx/paragon';
import { Question, TrendingUp } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import FloatingCollapsible from '../FloatingCollapsible';
import messages, { TRACK_LEARNER_PROGRESS_TITLE } from './messages';
import { dismissOnboardingTour, reopenOnboardingTour } from '../../data/actions/enterpriseCustomerAdmin';
import { Step } from './AdminOnboardingTours/OnboardingSteps';
import { ADMIN_TOUR_TARGETS } from './AdminOnboardingTours/constants';

interface Props {
  onboardingTourCompleted: boolean;
  onboardingTourDismissed: boolean;
  dismissOnboardingTour: () => void;
  reopenOnboardingTour: () => void;
  onTourSelect?: (targetId: string) => void;
}

const QUICK_START_GUIDE_STEPS = [
  {
    icon: TrendingUp,
    title: TRACK_LEARNER_PROGRESS_TITLE,
    timeEstimate: 2,
    targetId: ADMIN_TOUR_TARGETS.LEARNER_PROGRESS_SIDEBAR,
  },
  // Add other steps here
];

const TourCollapsible: FC<Props> = (
  {
    onboardingTourCompleted = true,
    onboardingTourDismissed = true,
    dismissOnboardingTour: dismissTour,
    reopenOnboardingTour: reopenTour,
    onTourSelect,
  },
) => {
  const intl = useIntl();
  const [showCollapsible, setShowCollapsible] = useState(!onboardingTourCompleted && !onboardingTourDismissed);

  const handleDismiss = () => {
    setShowCollapsible(false);
    dismissTour();
  };

  const handleReopenTour = () => {
    setShowCollapsible(true);
    reopenTour();
  };

  return (
    <>
      {showCollapsible && (
        <FloatingCollapsible
          title={intl.formatMessage(messages.collapsibleTitle)}
          onDismiss={handleDismiss}
        >
          <p className="small">{intl.formatMessage(messages.collapsibleIntro)}</p>
          <Stack gap={3} className="mb-3">
            {QUICK_START_GUIDE_STEPS.map(step => (
              <Step
                key={step.title}
                icon={step.icon}
                title={step.title}
                timeEstimate={step.timeEstimate}
                targetId={step.targetId}
                onTourSelect={onTourSelect}
              />
            ))}
          </Stack>
        </FloatingCollapsible>
      )}
      {!showCollapsible && (
        <OverlayTrigger
          placement="left"
          overlay={(
            <Tooltip id="product-tours-question-icon-tooltip">
              {intl.formatMessage(messages.questionIconTooltip)}
            </Tooltip>
      )}
        >
          <IconButton
            src={Question}
            className="info-button bottom-right-fixed"
            iconAs={Icon}
            alt="More details"
            onClick={handleReopenTour}
          />
        </OverlayTrigger>
      )}
    </>
  );
};

const mapStateToProps = state => ({
  onboardingTourCompleted: state.enterpriseCustomerAdmin.onboardingTourCompleted as boolean,
  onboardingTourDismissed: state.enterpriseCustomerAdmin.onboardingTourDismissed as boolean,
});

const mapDispatchToProps = dispatch => ({
  dismissOnboardingTour: () => {
    dispatch(dismissOnboardingTour());
  },
  reopenOnboardingTour: () => {
    dispatch(reopenOnboardingTour());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TourCollapsible);

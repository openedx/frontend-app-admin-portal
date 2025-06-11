import React, { FC } from 'react';
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
import { TRACK_LEARNER_PROGRESS_TARGETS } from './AdminOnboardingTours/constants';

interface Props {
  dismissOnboardingTour: () => void;
  reopenOnboardingTour: () => void;
  onTourSelect?: (targetId: string) => void;
  showCollapsible: boolean;
  setShowCollapsible: (value: boolean) => void;
}

const QUICK_START_GUIDE_STEPS = [
  {
    icon: TrendingUp,
    title: TRACK_LEARNER_PROGRESS_TITLE,
    timeEstimate: 2,
    targetId: TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR,
  },
  // Add other steps here
];

const TourCollapsible: FC<Props> = (
  {
    dismissOnboardingTour: dismissTour,
    reopenOnboardingTour: reopenTour,
    onTourSelect,
    showCollapsible,
    setShowCollapsible,
  },
) => {
  const intl = useIntl();

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

const mapDispatchToProps = dispatch => ({
  dismissOnboardingTour: () => {
    dispatch(dismissOnboardingTour());
  },
  reopenOnboardingTour: () => {
    dispatch(reopenOnboardingTour());
  },
});

export default connect(mapDispatchToProps)(TourCollapsible);

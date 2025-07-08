import React, { FC } from 'react';
import { connect } from 'react-redux';

import {
  IconButton, Icon, OverlayTrigger, Tooltip, Stack,
} from '@openedx/paragon';
import {
  InsertChartOutlined,
  Question,
  TrendingUp,
  CreditCard,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import FloatingCollapsible from '../FloatingCollapsible';
import messages, {
  TRACK_LEARNER_PROGRESS_TITLE,
  VIEW_ENROLLMENTS_INSIGHT_TITLE,
  ADMINISTER_SUBSCRIPTIONS_TITLE,
} from './AdminOnboardingTours/messages';
import { dismissOnboardingTour, reopenOnboardingTour } from '../../data/actions/enterpriseCustomerAdmin';
import { Step } from './AdminOnboardingTours/OnboardingSteps';
import {
  TRACK_LEARNER_PROGRESS_TARGETS,
  ANALYTICS_INSIGHTS_FLOW,
  ADMINISTER_SUBSCRIPTIONS_FLOW,
} from './AdminOnboardingTours/constants';

interface Props {
  dismissOnboardingTour: (adminUuid: string) => void;
  reopenOnboardingTour: (adminUuid: string) => void;
  onTourSelect?: (targetId: string) => void;
  uuid: string;
  showCollapsible: boolean;
  setShowCollapsible: (value: boolean) => void;
  enableSubscriptionManagementScreen: boolean;
}

const QUICK_START_GUIDE_STEPS = [
  {
    icon: TrendingUp,
    title: TRACK_LEARNER_PROGRESS_TITLE,
    timeEstimate: 2,
    targetId: TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR,
  },
  {
    icon: InsertChartOutlined,
    title: VIEW_ENROLLMENTS_INSIGHT_TITLE,
    timeEstimate: 1,
    targetId: ANALYTICS_INSIGHTS_FLOW.SIDEBAR,
  },
  {
    icon: CreditCard,
    title: ADMINISTER_SUBSCRIPTIONS_TITLE,
    timeEstimate: 2,
    targetId: ADMINISTER_SUBSCRIPTIONS_FLOW.SIDEBAR,
  },
];

const TourCollapsible: FC<Props> = (
  {
    dismissOnboardingTour: dismissTour,
    reopenOnboardingTour: reopenTour,
    onTourSelect,
    showCollapsible,
    setShowCollapsible,
    uuid: adminUuid,
    enableSubscriptionManagementScreen,
  },
) => {
  const intl = useIntl();

  const handleDismiss = () => {
    setShowCollapsible(false);
    dismissTour(adminUuid);
  };

  const handleReopenTour = () => {
    setShowCollapsible(true);
    reopenTour(adminUuid);
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
            {QUICK_START_GUIDE_STEPS.map(step => {
              if (step.title === ADMINISTER_SUBSCRIPTIONS_TITLE && !enableSubscriptionManagementScreen) {
                return <div />;
              }
              return (
                <Step
                  key={step.title}
                  icon={step.icon}
                  title={step.title}
                  timeEstimate={step.timeEstimate}
                  targetId={step.targetId}
                  onTourSelect={onTourSelect}
                />
              );
            })}
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
  uuid: state.enterpriseCustomerAdmin.uuid as string,
  enableSubscriptionManagementScreen: state.portalConfiguration.enableSubscriptionManagementScreen as boolean,
});

const mapDispatchToProps = dispatch => ({
  dismissOnboardingTour: (adminUuid: string) => {
    dispatch(dismissOnboardingTour(adminUuid));
  },
  reopenOnboardingTour: (adminUuid: string) => {
    dispatch(reopenOnboardingTour(adminUuid));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TourCollapsible);

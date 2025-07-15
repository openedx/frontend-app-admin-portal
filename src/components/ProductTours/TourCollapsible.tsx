import React, { FC } from 'react';
import { connect } from 'react-redux';

import {
  IconButton, Icon, OverlayTrigger, Tooltip, Stack,
} from '@openedx/paragon';
import {
  CreditCard, InsertChartOutlined, Person, Question, Settings, TextSnippet, TrendingUp,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import FloatingCollapsible from '../FloatingCollapsible';
import messages, {
  ADMINISTER_SUBSCRIPTIONS_TITLE,
  CUSTOMIZE_REPORTS_TITLE,
  ORGANIZE_LEARNERS_TITLE,
  SET_UP_PREFERENCES_TITLE,
  TRACK_LEARNER_PROGRESS_TITLE,
  VIEW_ENROLLMENTS_INSIGHT_TITLE,
} from './AdminOnboardingTours/messages';
import { dismissOnboardingTour, reopenOnboardingTour } from '../../data/actions/enterpriseCustomerAdmin';
import { Step } from './AdminOnboardingTours/OnboardingSteps';
import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ANALYTICS_INSIGHTS_TARGETS,
  CUSTOMIZE_REPORTS_SIDEBAR,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from './AdminOnboardingTours/constants';
import { TOUR_TARGETS } from './constants';

interface Props {
  dismissOnboardingTour: (adminUuid: string) => void;
  reopenOnboardingTour: (adminUuid: string) => void;
  onTourSelect?: (targetId: string) => void;
  uuid: string;
  showCollapsible: boolean;
  setShowCollapsible: (value: boolean) => void;
  enableSubscriptionManagementScreen: boolean;
  enableReportingConfigScreen: boolean;
}

type StepDefinition = {
  icon: React.ComponentType,
  title: string,
  timeEstimate: number,
  targetId: string
};

const QUICK_START_GUIDE_STEPS: StepDefinition[] = [{
  icon: TrendingUp,
  title: TRACK_LEARNER_PROGRESS_TITLE,
  timeEstimate: 2,
  targetId: TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR,
}, {
  icon: InsertChartOutlined,
  title: VIEW_ENROLLMENTS_INSIGHT_TITLE,
  timeEstimate: 1,
  targetId: ANALYTICS_INSIGHTS_TARGETS.SIDEBAR,
}, {
  icon: CreditCard,
  title: ADMINISTER_SUBSCRIPTIONS_TITLE,
  timeEstimate: 2,
  targetId: ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR,
}, {
  icon: Person,
  title: ORGANIZE_LEARNERS_TITLE,
  timeEstimate: 2,
  targetId: ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR,
}, {
  icon: TextSnippet,
  title: CUSTOMIZE_REPORTS_TITLE,
  timeEstimate: 1,
  targetId: CUSTOMIZE_REPORTS_SIDEBAR,
},
{
  icon: Settings,
  title: SET_UP_PREFERENCES_TITLE,
  timeEstimate: 1,
  targetId: TOUR_TARGETS.SETTINGS_SIDEBAR,
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
    enableReportingConfigScreen,
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

  const steps = QUICK_START_GUIDE_STEPS.filter(step => {
    switch (step.title) {
      case ADMINISTER_SUBSCRIPTIONS_TITLE:
        return enableSubscriptionManagementScreen;
      case CUSTOMIZE_REPORTS_TITLE:
        return enableReportingConfigScreen;
      default:
        return true;
    }
  });

  return (
    <>
      {showCollapsible && (
        <FloatingCollapsible
          title={intl.formatMessage(messages.collapsibleTitle)}
          onDismiss={handleDismiss}
        >
          <p className="small">{intl.formatMessage(messages.collapsibleIntro)}</p>
          <Stack gap={3} className="mb-3">
            {steps.map(step => (
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
  uuid: state.enterpriseCustomerAdmin.uuid as string,
  enableSubscriptionManagementScreen: state.portalConfiguration.enableSubscriptionManagementScreen as boolean,
  enableReportingConfigScreen: state.portalConfiguration.enableReportingConfigScreen as boolean,
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

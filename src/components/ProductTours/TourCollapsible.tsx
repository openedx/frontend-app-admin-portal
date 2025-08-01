import React, { FC, useEffect, useState } from 'react';
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
import useFetchCompletedOnboardingFlows from './AdminOnboardingTours/data/useFetchCompletedOnboardingFlows';
import { configuration } from '../../config';

interface Props {
  adminUuid: string;
  dismissOnboardingTour: (adminUuid: string) => void;
  enableReportingConfigScreen: boolean;
  enableSubscriptionManagementScreen: boolean;
  onTourSelect?: (targetId: string) => void;
  reopenOnboardingTour: (adminUuid: string) => void;
  showCollapsible: boolean;
  setShowCollapsible: (value: boolean) => void;
}

type StepDefinition = {
  icon: React.ComponentType,
  title: string,
  timeEstimate: number,
  targetId: string,
  completed?: boolean
};

const TourCollapsible: FC<Props> = (
  {
    adminUuid,
    dismissOnboardingTour: dismissTour,
    enableReportingConfigScreen,
    enableSubscriptionManagementScreen,
    onTourSelect,
    reopenOnboardingTour: reopenTour,
    showCollapsible,
    setShowCollapsible,
  },
) => {
  const intl = useIntl();
  const [onboardingSteps, setOnboardingSteps] = useState<StepDefinition[] | undefined>();
  const { data: completedTourFlows } = useFetchCompletedOnboardingFlows(adminUuid);

  const handleDismiss = () => {
    setShowCollapsible(false);
    dismissTour(adminUuid);
  };

  const handleReopenTour = () => {
    setShowCollapsible(true);
    reopenTour(adminUuid);
  };

  useEffect(() => {
    const QUICK_START_GUIDE_STEPS: StepDefinition[] = [{
      icon: TrendingUp,
      title: TRACK_LEARNER_PROGRESS_TITLE,
      timeEstimate: 2,
      targetId: TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR,
      completed: false,
    }, {
      icon: InsertChartOutlined,
      title: VIEW_ENROLLMENTS_INSIGHT_TITLE,
      timeEstimate: 1,
      targetId: ANALYTICS_INSIGHTS_TARGETS.SIDEBAR,
      completed: false,
    }, {
      icon: CreditCard,
      title: ADMINISTER_SUBSCRIPTIONS_TITLE,
      timeEstimate: 2,
      targetId: ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR,
      completed: false,
    }, {
      icon: Person,
      title: ORGANIZE_LEARNERS_TITLE,
      timeEstimate: 2,
      targetId: ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR,
      completed: false,
    }, {
      icon: TextSnippet,
      title: CUSTOMIZE_REPORTS_TITLE,
      timeEstimate: 1,
      targetId: CUSTOMIZE_REPORTS_SIDEBAR,
      completed: false,
    }, {
      icon: Settings,
      title: SET_UP_PREFERENCES_TITLE,
      timeEstimate: 1,
      targetId: TOUR_TARGETS.SETTINGS_SIDEBAR,
      completed: false,
    }];

    const FLOW_UUID_MAPPING = new Map([
      [TRACK_LEARNER_PROGRESS_TITLE, configuration.ADMIN_ONBOARDING_UUIDS.FLOW_TRACK_LEARNER_PROGRESS_UUID?.toString()],
      [VIEW_ENROLLMENTS_INSIGHT_TITLE, configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ENROLLMENT_INSIGHTS?.toString()],
      [ADMINISTER_SUBSCRIPTIONS_TITLE, configuration.ADMIN_ONBOARDING_UUIDS.FLOW_SUBSCRIPTIONS_UUID?.toString()],
      [ORGANIZE_LEARNERS_TITLE, configuration.ADMIN_ONBOARDING_UUIDS.FLOW_ORGANIZE_LEARNERS_UUID?.toString()],
      [CUSTOMIZE_REPORTS_TITLE, configuration.ADMIN_ONBOARDING_UUIDS.FLOW_CUSTOMIZE_REPORTS_UUID?.toString()],
      [SET_UP_PREFERENCES_TITLE, configuration.ADMIN_ONBOARDING_UUIDS.FLOW_PREFERENCES_UUID?.toString()],
    ]);

    // filter out steps that are turned off for the user
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

    if (completedTourFlows) {
      steps.forEach((step) => {
        const flowUuid = FLOW_UUID_MAPPING.get(step.title);
        if (flowUuid && completedTourFlows?.includes(flowUuid)) {
          step.completed = true; // eslint-disable-line no-param-reassign
        }
      });
    }
    setOnboardingSteps(steps);
  }, [completedTourFlows, enableReportingConfigScreen, enableSubscriptionManagementScreen]);

  return (
    <>
      {showCollapsible && (
        <FloatingCollapsible
          title={intl.formatMessage(messages.collapsibleTitle)}
          onDismiss={handleDismiss}
        >
          <p className="small">{intl.formatMessage(messages.collapsibleIntro)}</p>
          <Stack gap={2} className="mb-3">
            {onboardingSteps?.map(step => (
              <Step
                completed={step.completed}
                icon={step.icon}
                key={step.title}
                onTourSelect={onTourSelect}
                targetId={step.targetId}
                timeEstimate={step.timeEstimate}
                title={step.title}
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
  adminUuid: state.enterpriseCustomerAdmin.uuid as string,
  enableReportingConfigScreen: state.portalConfiguration.enableReportingConfigScreen as boolean,
  enableSubscriptionManagementScreen: state.portalConfiguration.enableSubscriptionManagementScreen as boolean,
  onboardingTourCompleted: state.enterpriseCustomerAdmin.onboardingTourCompleted as boolean,
  onboardingTourDismissed: state.enterpriseCustomerAdmin.onboardingTourDismissed as boolean,
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

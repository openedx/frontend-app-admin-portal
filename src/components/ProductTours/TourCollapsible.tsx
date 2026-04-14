import React, {
  FC, useContext, useEffect, useState,
} from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash-es';
import {
  IconButton, Icon, OverlayTrigger, Tooltip, Stack,
} from '@openedx/paragon';
import {
  CreditCard, InsertChartOutlined, MoneyOutline, Person, Question, Settings, TextSnippet, TrendingUp,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import FloatingCollapsible from '../FloatingCollapsible';
import messages from './AdminOnboardingTours/messages';
import { dismissOnboardingTour, reopenOnboardingTour } from '../../data/actions/enterpriseCustomerAdmin';
import { Step } from './AdminOnboardingTours/OnboardingSteps';
import {
  ADMINISTER_SUBSCRIPTIONS_TARGETS,
  ALLOCATE_LEARNING_BUDGETS_TARGETS,
  ANALYTICS_V2_TARGETS,
  CUSTOMIZE_REPORTS_SIDEBAR,
  ORGANIZE_LEARNER_TARGETS,
  TRACK_LEARNER_PROGRESS_TARGETS,
} from './AdminOnboardingTours/constants';
import { TOUR_TARGETS } from './constants';
import useFetchCompletedOnboardingFlows from './AdminOnboardingTours/data/useFetchCompletedOnboardingFlows';
import { configuration, features } from '../../config';
import TourCompleteModal from './TourCompleteModal';
import { EnterpriseSubsidiesContext } from '../EnterpriseSubsidiesContext';

interface Props {
  adminUuid: string;
  dismissOnboardingTour: (adminUuid: string) => void;
  enableAnalyticsScreen: boolean;
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
    enableAnalyticsScreen,
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
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const { data: onboardingTourData } = useFetchCompletedOnboardingFlows(adminUuid);
  const { canManageLearnerCredit } = useContext(EnterpriseSubsidiesContext);
  const { isLoadingCustomerAgreement, customerAgreement } = useContext(EnterpriseSubsidiesContext);

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
      title: intl.formatMessage(messages.trackLearnerProgressStepOneTitle),
      timeEstimate: 2,
      targetId: TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR,
      completed: false,
    }, {
      icon: InsertChartOutlined,
      title: intl.formatMessage(messages.analyticsStepOneTitle),
      timeEstimate: 1,
      targetId: ANALYTICS_V2_TARGETS.SIDEBAR,
      completed: false,
    }, {
      icon: MoneyOutline,
      title: intl.formatMessage(messages.allocateLearningBudgetTitle),
      timeEstimate: 2,
      targetId: ALLOCATE_LEARNING_BUDGETS_TARGETS.SIDEBAR,
    }, {
      icon: CreditCard,
      title: intl.formatMessage(messages.administerSubscriptionsTitle),
      timeEstimate: 2,
      targetId: ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR,
      completed: false,
    }, {
      icon: Person,
      title: intl.formatMessage(messages.organizeLearnersStepOneTitle),
      timeEstimate: 2,
      targetId: ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR,
      completed: false,
    }, {
      icon: TextSnippet,
      title: intl.formatMessage(messages.viewCustomizeReportsTitle),
      timeEstimate: 1,
      targetId: CUSTOMIZE_REPORTS_SIDEBAR,
      completed: false,
    }, {
      icon: Settings,
      title: intl.formatMessage(messages.viewSetUpPreferencesTitle),
      timeEstimate: 1,
      targetId: TOUR_TARGETS.SETTINGS_SIDEBAR,
      completed: false,
    }];

    const { ADMIN_ONBOARDING_UUIDS } = configuration;
    const FLOW_UUID_MAPPING = new Map([
      [ALLOCATE_LEARNING_BUDGETS_TARGETS.SIDEBAR, ADMIN_ONBOARDING_UUIDS.FLOW_ALLOCATE_BUDGETS_UUID?.toString()],
      [TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR,
        ADMIN_ONBOARDING_UUIDS.FLOW_TRACK_LEARNER_PROGRESS_UUID?.toString(),
      ],
      [ANALYTICS_V2_TARGETS.SIDEBAR, ADMIN_ONBOARDING_UUIDS.FLOW_ANALYTICS_UUID?.toString()],
      [ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR, ADMIN_ONBOARDING_UUIDS.FLOW_SUBSCRIPTIONS_UUID?.toString()],
      [ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR,
        ADMIN_ONBOARDING_UUIDS.FLOW_ORGANIZE_LEARNERS_UUID?.toString(),
      ],
      [CUSTOMIZE_REPORTS_SIDEBAR, ADMIN_ONBOARDING_UUIDS.FLOW_CUSTOMIZE_REPORTS_UUID?.toString()],
      [TOUR_TARGETS.SETTINGS_SIDEBAR, ADMIN_ONBOARDING_UUIDS.FLOW_PREFERENCES_UUID?.toString()],
    ]);

    // filter out steps that are turned off for the user
    const steps = QUICK_START_GUIDE_STEPS.filter(step => {
      switch (step.targetId) {
        case ADMINISTER_SUBSCRIPTIONS_TARGETS.SIDEBAR:
          return enableSubscriptionManagementScreen
            && (!isLoadingCustomerAgreement && !isEmpty(customerAgreement?.subscriptions));
        case ALLOCATE_LEARNING_BUDGETS_TARGETS.SIDEBAR:
          return canManageLearnerCredit;
        case CUSTOMIZE_REPORTS_SIDEBAR:
          return enableReportingConfigScreen;
        case ANALYTICS_V2_TARGETS.SIDEBAR:
          return features.ANALYTICS && enableAnalyticsScreen;
        default:
          return true;
      }
    });

    if (onboardingTourData?.completedTourFlows) {
      steps.forEach((step) => {
        const flowUuid = FLOW_UUID_MAPPING.get(step.targetId);
        if (flowUuid && onboardingTourData?.completedTourFlows?.includes(flowUuid)) {
          step.completed = true; // eslint-disable-line no-param-reassign
        }
      });

      if (onboardingTourData?.completedTourFlows.length === steps.length
        && !onboardingTourData?.onboardingTourCompleted) {
        setShowCompletedModal(true);
      }
    }
    setOnboardingSteps(steps);
  }, [
    canManageLearnerCredit,
    customerAgreement?.subscriptions,
    enableAnalyticsScreen,
    enableReportingConfigScreen,
    enableSubscriptionManagementScreen,
    isLoadingCustomerAgreement,
    onboardingTourData?.completedTourFlows,
    onboardingTourData?.onboardingTourCompleted,
    intl,
  ]);

  return (
    <>
      {showCompletedModal && (
        <TourCompleteModal
          adminUuid={adminUuid}
        />
      )}
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
                key={step.targetId}
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
  enableAnalyticsScreen: state.portalConfiguration.enableAnalyticsScreen as boolean,
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

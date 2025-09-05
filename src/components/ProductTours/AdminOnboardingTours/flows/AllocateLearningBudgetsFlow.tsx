import { useIntl } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { useParams } from 'react-router';
import { ALLOCATE_LEARNING_BUDGETS_TARGETS, ADMIN_TOUR_EVENT_NAMES } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { orderBudgets, useBudgetDetailActivityOverview, useSubsidyAccessPolicy } from '../../../learner-credit-management/data';
import { useEnterpriseBudgets } from '../../../EnterpriseSubsidiesContext/data/hooks';

interface CreateTourFlowsProps {
  currentStep: number;
  enablePortalLearnerCreditManagementScreen: boolean;
  enterpriseFeatures: {
    topDownAssignmentRealTimeLcm: boolean;
  };
  enterpriseId: string;
  enterpriseSlug: string;
  handleBackTour: (backEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  setCurrentStep: (currentStep: number) => void;
  targetSelector?: string;
}

const AllocateLearningBudgetsFlow = ({
  currentStep,
  enterpriseSlug,
  handleBackTour,
  handleEndTour,
  hasSpentTransactions,
  hasContentAssignments,
  intl,
  isOnBudgetPage,
  policyType,
  setCurrentStep,
  targetSelector,
}: CreateTourFlowsProps & {
  intl: any;
  isOnBudgetPage: boolean;
  hasSpentTransactions: boolean;
  hasContentAssignments: boolean;
  policyType: string;
}): Array<TourStep> => {
  function handleAdvanceTour(advanceEventName: string) {
    const newIndex = currentStep + 1;
    const viewBudgetButton = document.getElementById(ALLOCATE_LEARNING_BUDGETS_TARGETS.VIEW_BUDGET);
    if (viewBudgetButton && targetSelector === ALLOCATE_LEARNING_BUDGETS_TARGETS.VIEW_BUDGET) {
      viewBudgetButton.click();
      setCurrentStep(0);
      sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
      return;
    }
    sendEnterpriseTrackEvent(enterpriseSlug, advanceEventName, { 'completed-step': newIndex });
    setCurrentStep(newIndex);
  }

  const onAllocateAdvance = () => {
    handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ALLOCATE_ASSIGNMENT_ADVANCE_EVENT_NAME);
  };
  const onAllocateBack = () => handleBackTour(ADMIN_TOUR_EVENT_NAMES.ALLOCATE_ASSIGNMENT_BACK_EVENT_NAME);
  if (isOnBudgetPage) {
    if (policyType === 'Assignment') {
      // Assignment budget with spend or assignment activity
      if (isOnBudgetPage && hasSpentTransactions && hasContentAssignments) {
        return [
          {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_DETAIL_CARD}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepThreeAssignment),
            onAdvance: onAllocateAdvance,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.NEW_ASSIGNMENT_BUDGET_BUTTON}`,
            placement: 'bottom',
            body: intl.formatMessage(messages.allocateLearningBudgetStepFourAssignment),
            onAdvance: onAllocateAdvance,
            onBack: onAllocateBack,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.UTILIZATION_DETAILS_DROPDOWN}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepFiveAssignment),
            onAdvance: onAllocateAdvance,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.TRACK_BUDGET_ACTIVITY}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepSixAssignment),
            onAdvance: onAllocateAdvance,
            onBack: onAllocateBack,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_TABLE}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepSevenAssignment),
            onAdvance: onAllocateAdvance,
            onBack: onAllocateBack,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_SPENT_TABLE}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepEightAssignment),
            onAdvance: onAllocateAdvance,
            onBack: onAllocateBack,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_CATALOG_TAB}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepNineAssignment),
            onAdvance: onAllocateAdvance,
            onBack: onAllocateBack,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.LEARNER_CREDIT_MANAGEMENT_BREADCRUMBS}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepTen),
            onBack: onAllocateBack,
            onEnd: handleEndTour,
          },
        ];
      // Zero state assignment budget
      } if (!hasSpentTransactions && !hasContentAssignments) {
        return [
          {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_DETAIL_CARD}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepThreeAssignment),
            onAdvance: onAllocateAdvance,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.NEW_ASSIGNMENT_BUDGET_BUTTON}`,
            placement: 'bottom',
            body: intl.formatMessage(messages.allocateLearningBudgetStepFourAssignment),
            onAdvance: onAllocateAdvance,
          }, {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.NO_ASSIGNMENT_BUDGET_ACTIVITY}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepFiveAssignmentZeroState),
            onAdvance: onAllocateAdvance,
          },
          {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_CATALOG_TAB}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepSixAssignmentZeroState),
            onAdvance: onAllocateAdvance,
          },
          {
            target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.LEARNER_CREDIT_MANAGEMENT_BREADCRUMBS}`,
            placement: 'top',
            body: intl.formatMessage(messages.allocateLearningBudgetStepTen),
            onEnd: handleEndTour,
          },
        ];
      }
    // Browse and enroll budget
    } else if (policyType === 'BnE') {
      return [
        {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_DETAIL_CARD}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepThreeBnE),
          onAdvance: onAllocateAdvance,
        }, {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.TRACK_BUDGET_ACTIVITY}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepFourBnE),
          onAdvance: onAllocateAdvance,
          onBack: onAllocateBack,
        }, {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.LEARNER_CREDIT_MANAGEMENT_BREADCRUMBS}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepTen),
          onEnd: handleEndTour,
        },
      ];
    // Invite-only browse and enroll budget
    } else if (policyType === 'Invite only BnE') {
      return [
        {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_DETAIL_CARD}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepThreeBnE),
          onAdvance: onAllocateAdvance,
        }, {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.INVITE_MEMBERS_BUDGET_BUTTON}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepFourInviteBnE),
          onAdvance: onAllocateAdvance,
          onBack: onAllocateBack,
        }, {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.TRACK_BUDGET_ACTIVITY}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepFourBnE),
          onAdvance: onAllocateAdvance,
          onBack: onAllocateBack,
        }, {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_CATALOG_TAB}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepFiveInviteBnE),
          onAdvance: onAllocateAdvance,
          onBack: onAllocateBack,
        }, {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.BUDGET_MEMBERS_TAB}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepSixInviteBnE),
          onAdvance: onAllocateAdvance,
          onBack: onAllocateBack,
        }, {
          target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.LEARNER_CREDIT_MANAGEMENT_BREADCRUMBS}`,
          placement: 'top',
          body: intl.formatMessage(messages.allocateLearningBudgetStepTen),
          onEnd: handleEndTour,
        },
      ];
    }
  }

  // Main allocate learning budgets page flow (steps 1-2)
  return [
    {
      target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.SIDEBAR}`,
      placement: 'right',
      title: intl.formatMessage(messages.allocateLearningBudgetTitle),
      body: intl.formatMessage(messages.allocateLearningBudgetStepOneBody),
      onAdvance: onAllocateAdvance,
    },
    {
      target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.VIEW_BUDGET}`,
      placement: 'left',
      body: policyType === 'Assignment' ? intl.formatMessage(messages.allocateLearningBudgetStepTwoAssignment) : intl.formatMessage(messages.allocateLearningBudgetStepTwoBnE),
      onBack: onAllocateBack,
      onEnd: onAllocateAdvance,
    },
  ];
};

const useAllocateLearningBudgetsFlow = (props: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const params = useParams();
  const isTopDownAssignmentEnabled = props.enterpriseFeatures.topDownAssignmentRealTimeLcm;

  const { data: budgetActivityOverview } = useBudgetDetailActivityOverview({
    enterpriseUUID: props.enterpriseId,
    isTopDownAssignmentEnabled,
  });

  const { data: budgetsOverview } = useEnterpriseBudgets({
    enablePortalLearnerCreditManagementScreen: props.enablePortalLearnerCreditManagementScreen,
    enterpriseId: props.enterpriseId,
    isTopDownAssignmentEnabled,
  });

  const { budgets } = budgetsOverview || {};
  const orderedBudgets = orderBudgets(intl, budgets);
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(orderedBudgets[0]?.id);
  let policyType;
  if (subsidyAccessPolicy) {
    if (subsidyAccessPolicy?.policyType === 'AssignedLearnerCreditAccessPolicy') {
      policyType = 'Assignment';
    } else if (subsidyAccessPolicy.groupAssociations?.length > 0) {
      policyType = 'Invite only BnE';
    } else {
      policyType = 'BnE';
    }
  }

  const hasSpentTransactions = budgetActivityOverview?.spentTransactions?.count > 0;
  const hasContentAssignments = budgetActivityOverview?.contentAssignments?.count > 0;
  const budgetUuid = params['*'];
  const isOnBudgetPage = !!budgetUuid;

  return AllocateLearningBudgetsFlow({
    ...props,
    intl,
    hasSpentTransactions,
    hasContentAssignments,
    isOnBudgetPage,
    policyType,
  });
};

export default useAllocateLearningBudgetsFlow;

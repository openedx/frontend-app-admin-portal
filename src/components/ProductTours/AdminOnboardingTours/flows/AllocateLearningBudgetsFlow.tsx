import { useIntl } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';
import { ALLOCATE_LEARNING_BUDGETS_TARGETS, ADMIN_TOUR_EVENT_NAMES } from '../constants';
import messages from '../messages';
import { TourStep } from '../../types';
import { useBudgetDetailActivityOverview } from '../../../learner-credit-management/data';

interface CreateTourFlowsProps {
  handleAdvanceTour: (advanceEventName: string) => void;
  handleBackTour: (backEventName: string) => void;
  handleEndTour: (endEventName: string, flowUuid?: string) => void;
  enablePortalLearnerCreditManagementScreen: boolean;
  enterpriseUUID: string;
  enterpriseFeatures: {
    topDownAssignmentRealTimeLcm: boolean;
  };
}

const AllocateLearningBudgetsFlow = ({
  handleAdvanceTour,
  handleBackTour,
  handleEndTour,
  intl,
  hasSpentTransactions,
  hasContentAssignments,
  isOnAssignmentPage,
}: CreateTourFlowsProps & {
  intl: any;
  hasSpentTransactions: boolean;
  hasContentAssignments: boolean;
  isOnAssignmentPage: boolean;
}): Array<TourStep> => {
  const onAllocateAdvance = () => {
    handleAdvanceTour(ADMIN_TOUR_EVENT_NAMES.ALLOCATE_ASSIGNMENT_ADVANCE_EVENT_NAME);
  };
  const onAllocateBack = () => handleBackTour(ADMIN_TOUR_EVENT_NAMES.ALLOCATE_ASSIGNMENT_BACK_EVENT_NAME);

  if (isOnAssignmentPage && hasSpentTransactions && hasContentAssignments) {
    return [
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.ASSIGNMENT_BUDGET_DETAIL_CARD}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepFourBody),
        onAdvance: onAllocateAdvance,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.NEW_ASSIGNMENT_BUDGET_BUTTON}`,
        placement: 'bottom',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepFiveBody),
        onAdvance: onAllocateAdvance,
        onBack: onAllocateBack,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.TRACK_BUDGET_ACTIVITY}`,
        placement: 'right',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepSevenBody),
        onAdvance: onAllocateAdvance,
        onBack: onAllocateBack,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.ASSIGNMENT_BUDGET_TABLE}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepEightBody),
        onAdvance: onAllocateAdvance,
        onBack: onAllocateBack,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.ASSIGNMENT_BUDGET_SPENT_TABLE}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepNineBody),
        onAdvance: onAllocateAdvance,
        onBack: onAllocateBack,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.ASSIGNMENT_BUDGET_CATALOG_TAB}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepTenBody),
        onAdvance: onAllocateAdvance,
        onBack: onAllocateBack,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.LEARNER_CREDIT_MANAGEMENT_BREADCRUMBS}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepElevenBody),
        onBack: onAllocateBack,
        onEnd: handleEndTour,
      },
    ];
  }

  if (isOnAssignmentPage && !hasSpentTransactions && !hasContentAssignments) {
    return [
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.ASSIGNMENT_BUDGET_DETAIL_CARD}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepFourBody),
        onAdvance: onAllocateAdvance,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.NEW_ASSIGNMENT_BUDGET_BUTTON}`,
        placement: 'bottom',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepFiveBody),
        onAdvance: onAllocateAdvance,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.NO_ASSIGNMENT_BUDGET_ACTIVITY}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetZeroStateStepSixBody),
        onAdvance: onAllocateAdvance,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.ASSIGNMENT_BUDGET_CATALOG_TAB}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepTenBody),
        onAdvance: onAllocateAdvance,
      },
      {
        target: `#${ALLOCATE_LEARNING_BUDGETS_TARGETS.LEARNER_CREDIT_MANAGEMENT_BREADCRUMBS}`,
        placement: 'top',
        body: intl.formatMessage(messages.allocateAssignmentBudgetStepElevenBody),
        onEnd: handleEndTour,
      },
    ];
  }

  // Main allocate learning budgets page flow (steps 1-3)
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
      body: intl.formatMessage(messages.allocateLearningBudgetStepThreeBody),
      onBack: onAllocateBack,
      onEnd: onAllocateAdvance,
    },
  ];
};

const useAllocateLearningBudgetsFlow = (props: CreateTourFlowsProps): Array<TourStep> => {
  const intl = useIntl();
  const params = useParams();
  const isTopDownAssignmentEnabled = props.enterpriseFeatures.topDownAssignmentRealTimeLcm;

  const {
    data: budgetActivityOverview,
  } = useBudgetDetailActivityOverview({
    enterpriseUUID: props.enterpriseUUID,
    isTopDownAssignmentEnabled,
  });

  const hasSpentTransactions = budgetActivityOverview?.spentTransactions?.count > 0;
  const hasContentAssignments = budgetActivityOverview?.contentAssignments?.count > 0;
  const assignmentUuid = params['*'];
  const isOnAssignmentPage = !!assignmentUuid;

  return AllocateLearningBudgetsFlow({
    ...props,
    intl,
    hasSpentTransactions,
    hasContentAssignments,
    isOnAssignmentPage,
  });
};

export default useAllocateLearningBudgetsFlow;

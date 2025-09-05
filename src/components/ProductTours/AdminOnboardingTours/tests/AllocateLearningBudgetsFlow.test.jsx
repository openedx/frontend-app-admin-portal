import React from 'react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams } from 'react-router';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import useAllocateLearningBudgetsFlow from '../flows/AllocateLearningBudgetsFlow';
import { orderBudgets, useBudgetDetailActivityOverview, useSubsidyAccessPolicy } from '../../../learner-credit-management/data';
import { useEnterpriseBudgets } from '../../../EnterpriseSubsidiesContext/data/hooks';

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../../learner-credit-management/data', () => ({
  orderBudgets: jest.fn(),
  useBudgetDetailActivityOverview: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
}));

jest.mock('../../../EnterpriseSubsidiesContext/data/hooks', () => ({
  useEnterpriseBudgets: jest.fn(),
}));

const mockStore = configureStore([]);

const renderHookWithProviders = (hookFn, storeState = {}) => {
  const defaultState = {
    portalConfiguration: {
      enterpriseId: 'test-enterprise-uuid',
      enterpriseFeatures: {
        topDownAssignmentRealTimeLcm: true,
      },
    },
    ...storeState,
  };

  const store = mockStore(defaultState);

  return renderHook(hookFn, {
    wrapper: ({ children }) => (
      <IntlProvider locale="en" messages={{}}>
        <Provider store={store}>
          {children}
        </Provider>
      </IntlProvider>
    ),
  });
};

describe('useAllocateLearningBudgetsFlow', () => {
  const mockHandleBackTour = jest.fn();
  const mockHandleEndTour = jest.fn();
  const mockSetCurrentStep = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      isFetching: false,
      data: {
        spentTransactions: { count: 0 },
        contentAssignments: { count: 0 },
      },
    });
    useEnterpriseBudgets.mockReturnValue(
      {
        data: { budgets: [{ id: 'test-id' }] },
      },
    );
    orderBudgets.mockReturnValue([
      {
        id: 'test-id',
      },
    ]);
  });

  describe('Main subscription page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': null,
      });
      useSubsidyAccessPolicy.mockReturnValue({
        data: {
          policyType: 'AssignedLearnerCreditAccessPolicy',
        },
      });
    });

    it('should return main learner credit page flow when on main page', () => {
      const props = {
        currentStep: 0,
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
        enterpriseId: 'test-enterprise-uuid',
        enterpriseSlug: 'test-enterprise-slug',
        handleBackTour: mockHandleBackTour,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(2);
      expect(result.current[0].target).toBe('#learner-credit-link');
      expect(result.current[1].target).toBe('#learner-credit-view-budget-button');
    });

    it('should have correct step properties for main flow', () => {
      const props = {
        currentStep: 0,
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
        enterpriseId: 'test-enterprise-uuid',
        enterpriseSlug: 'test-enterprise-slug',
        handleBackTour: mockHandleBackTour,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current[0].title).toBe('Allocate learning budget');
      expect(result.current[0].placement).toBe('right');

      expect(result.current[1].title).toBeUndefined();
      expect(result.current[1].placement).toBe('left');
    });
  });

  describe('Detail learner credit page assignment flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'learner-credit/budget/test-subscription-uuid',
      });
      useSubsidyAccessPolicy.mockReturnValue({
        data: {
          policyType: 'AssignedLearnerCreditAccessPolicy',
        },
      });
    });

    it('should return learner credit detail page flow when on detail page with spent transactions and content assignments', () => {
      useBudgetDetailActivityOverview.mockReturnValue({
        isLoading: false,
        isFetching: false,
        data: {
          spentTransactions: { count: 1 },
          contentAssignments: { count: 1 },
        },
      });

      const props = {
        currentStep: 0,
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
        enterpriseId: 'test-enterprise-uuid',
        enterpriseSlug: 'test-enterprise-slug',
        handleBackTour: mockHandleBackTour,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(8);
      expect(result.current[0].target).toBe('#budget-detail-card');
      expect(result.current[1].target).toBe('#new-assignment-button');
      expect(result.current[2].target).toBe('#assignment-budget-utilization-details');
      expect(result.current[3].target).toBe('#track-budget-activity');
      expect(result.current[4].target).toBe('#budget-table');
      expect(result.current[5].target).toBe('#spent-budget-table');
      expect(result.current[6].target).toBe('#budget-catalog-tab');
      expect(result.current[7].target).toBe('#learner-credit-management-breadcrumbs');
    });

    it('should return learner credit detail page flow when on detail page with no spent transactions and no content assignments', () => {
      useBudgetDetailActivityOverview.mockReturnValue({
        isLoading: false,
        isFetching: false,
        data: {
          spentTransactions: { count: 0 },
          contentAssignments: { count: 0 },
        },
      });

      const props = {
        currentStep: 0,
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
        enterpriseId: 'test-enterprise-uuid',
        enterpriseSlug: 'test-enterprise-slug',
        handleBackTour: mockHandleBackTour,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#budget-detail-card');
      expect(result.current[1].target).toBe('#new-assignment-button');
      expect(result.current[2].target).toBe('#no-budget-activity');
      expect(result.current[3].target).toBe('#budget-catalog-tab');
      expect(result.current[4].target).toBe('#learner-credit-management-breadcrumbs');
    });

    it('should call handleEndTour on the final step', () => {
      useBudgetDetailActivityOverview.mockReturnValue({
        isLoading: false,
        isFetching: false,
        data: {
          spentTransactions: { count: 1 },
          contentAssignments: { count: 1 },
        },
      });

      const props = {
        currentStep: 0,
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
        enterpriseId: 'test-enterprise-uuid',
        enterpriseSlug: 'test-enterprise-slug',
        handleBackTour: mockHandleBackTour,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));
      result.current[7].onEnd();
      expect(mockHandleEndTour).toHaveBeenCalledTimes(1);
    });
  });

  describe('Detail learner credit page invite only BnE flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'learner-credit/budget/test-subscription-uuid',
      });
      useSubsidyAccessPolicy.mockReturnValue({
        data: {
          policyType: 'PerLearnerSpendCreditAccessPolicy',
          groupAssociations: ['group1-uuid', 'group2-uuid'],
        },
      });
    });

    it('should return invite only browse and enroll flow on budget page ', () => {
      const props = {
        currentStep: 0,
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
        enterpriseId: 'test-enterprise-uuid',
        enterpriseSlug: 'test-enterprise-slug',
        handleBackTour: mockHandleBackTour,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(6);
      expect(result.current[0].target).toBe('#budget-detail-card');
      expect(result.current[1].target).toBe('#invite-members-button');
      expect(result.current[2].target).toBe('#track-budget-activity');
      expect(result.current[3].target).toBe('#budget-catalog-tab');
      expect(result.current[4].target).toBe('#budget-members-tab');
      expect(result.current[5].target).toBe('#learner-credit-management-breadcrumbs');
    });
  });
  describe('Detail learner credit page regular Browse and Enroll flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'learner-credit/budget/test-subscription-uuid',
      });
      useSubsidyAccessPolicy.mockReturnValue({
        data: {
          policyType: 'PerLearnerSpendCreditAccessPolicy',
        },
      });
    });

    it('should return invite only browse and enroll flow on budget page ', () => {
      const props = {
        currentStep: 0,
        enablePortalLearnerCreditManagementScreen: true,
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
        enterpriseId: 'test-enterprise-uuid',
        enterpriseSlug: 'test-enterprise-slug',
        handleBackTour: mockHandleBackTour,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(3);
      expect(result.current[0].target).toBe('#budget-detail-card');
      expect(result.current[1].target).toBe('#track-budget-activity');
      expect(result.current[2].target).toBe('#learner-credit-management-breadcrumbs');
    });
  });
});

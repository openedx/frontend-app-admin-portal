import React from 'react';
import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams } from 'react-router';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import useAllocateLearningBudgetsFlow from '../flows/AllocateLearningBudgetsFlow';
import { useBudgetDetailActivityOverview } from '../../../learner-credit-management/data';

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../../learner-credit-management/data', () => ({
  useBudgetDetailActivityOverview: jest.fn(),
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
  const mockHandleAdvanceTour = jest.fn();
  const mockHandleEndTour = jest.fn();

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
  });

  describe('Main subscription page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': null,
      });
    });

    it('should return main learner credit page flow when on main page', () => {
      const props = {
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        enterpriseUUID: 'test-enterprise-uuid',
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(2);
      expect(result.current[0].target).toBe('#learner-credit-link');
      expect(result.current[1].target).toBe('#learner-credit-view-budget-button');
    });

    it('should have correct step properties for main flow', () => {
      const props = {
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        enterpriseUUID: 'test-enterprise-uuid',
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current[0].title).toBe('Allocate learning budget');
      expect(result.current[0].placement).toBe('right');

      expect(result.current[1].title).toBeUndefined();
      expect(result.current[1].placement).toBe('left');
    });

    it('should call handleAdvanceTour on the final step (view budget button)', () => {
      const props = {
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        enterpriseUUID: 'test-enterprise-uuid',
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      result.current[1].onEnd();
      expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(1);
    });
  });

  describe('Detail learner credit page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'learner-credit/budget/test-subscription-uuid',
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
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        enterpriseUUID: 'test-enterprise-uuid',
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(7);
      expect(result.current[0].target).toBe('#assignment-budget-detail-card');
      expect(result.current[1].target).toBe('#new-assignment-button');
      expect(result.current[2].target).toBe('#track-budget-activity');
      expect(result.current[3].target).toBe('#assignment-budget-table');
      expect(result.current[4].target).toBe('#assignment-spent-budget-table');
      expect(result.current[5].target).toBe('#assignment-budget-catalog-tab');
      expect(result.current[6].target).toBe('#learner-credit-management-breadcrumbs');
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
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        enterpriseUUID: 'test-enterprise-uuid',
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#assignment-budget-detail-card');
      expect(result.current[1].target).toBe('#new-assignment-button');
      expect(result.current[2].target).toBe('#no-budget-activity');
      expect(result.current[3].target).toBe('#assignment-budget-catalog-tab');
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
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        enterpriseUUID: 'test-enterprise-uuid',
        enterpriseFeatures: {
          topDownAssignmentRealTimeLcm: true,
        },
      };

      const { result } = renderHookWithProviders(() => useAllocateLearningBudgetsFlow(props));

      result.current[6].onEnd();
      expect(mockHandleEndTour).toHaveBeenCalledTimes(1);
    });
  });
});

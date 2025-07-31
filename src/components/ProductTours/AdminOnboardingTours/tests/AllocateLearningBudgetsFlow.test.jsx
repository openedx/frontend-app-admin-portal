import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams } from 'react-router';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AllocateLearningBudgetsFlow from '../flows/AllocateLearningBudgetsFlow';

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

const renderHookWithIntl = (hookFn) => renderHook(hookFn, {
  wrapper: ({ children }) => (
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  ),
});

describe('AllocateLearningBudgetsFlow', () => {
  const mockHandleAdvanceTour = jest.fn();
  const mockHandleEndTour = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Main subscription page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': null,
      });
    });

    it('should return main learner credit page flow when on main page', () => {
      const { result } = renderHookWithIntl(() => AllocateLearningBudgetsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current).toHaveLength(2);
      expect(result.current[0].target).toBe('#learner-credit-link');
      expect(result.current[1].target).toBe('#learner-credit-view-budget-button');
    });

    it('should have correct step properties for main flow', () => {
      const { result } = renderHookWithIntl(() => AllocateLearningBudgetsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current[0].title).toBe('Allocate learning budget');
      expect(result.current[0].placement).toBe('right');

      expect(result.current[1].title).toBeUndefined();
      expect(result.current[1].placement).toBe('left');
    });

    it('should call handleAdvanceTour on the final step (view budget button)', () => {
      const { result } = renderHookWithIntl(() => AllocateLearningBudgetsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      act(() => {
        result.current[1].onEnd();
      });
      expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(1);
    });
  });

  describe('Detail learner credit page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'learner-credit/budget/test-subscription-uuid',
      });
    });

    it('should return learner credit detail page flow when on detail page', () => {
      const { result } = renderHookWithIntl(() => AllocateLearningBudgetsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current).toHaveLength(8);
      expect(result.current[0].target).toBe('#assignment-budget-detail-card');
      expect(result.current[1].target).toBe('#new-assignment-button');
      expect(result.current[2].target).toBe('#assignment-budget-utilization-details');
      expect(result.current[3].target).toBe('#track-budget-activity');
      expect(result.current[4].target).toBe('#assignment-budget-table');
      expect(result.current[5].target).toBe('#assignment-spent-budget-table');
      expect(result.current[6].target).toBe('#assignment-budget-catalog-tab');
      expect(result.current[7].target).toBe('#learner-credit-management-breadcrumbs');
    });

    it('should call handleEndTour on the final step', () => {
      const { result } = renderHookWithIntl(() => AllocateLearningBudgetsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      act(() => {
        result.current[7].onEnd();
      });
      expect(mockHandleEndTour).toHaveBeenCalledTimes(1);
    });
  });
});

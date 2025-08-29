import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams } from 'react-router';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { SubsidyRequestsContext } from '../../../subsidy-requests';
import AdministerSubscriptionsFlow from '../flows/AdministerSubscriptionsFlow';
import { ADMIN_TOUR_EVENT_NAMES } from '../constants';

const requestsDisabled = {
  subsidyRequestConfiguration: {
    subsidyRequestsEnabled: false,
    subsidyType: 'license',
  },
};

const requestsEnabled = {
  subsidyRequestConfiguration: {
    subsidyRequestsEnabled: true,
    subsidyType: 'license',
  },
};

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const renderHookWithIntl = (hookFn) => renderHook(hookFn, {
  wrapper: ({ children }) => (
    <SubsidyRequestsContext.Provider value={requestsDisabled}>
      <IntlProvider locale="en" messages={{}}>
        {children}
      </IntlProvider>
    </SubsidyRequestsContext.Provider>
  ),
});

const renderHookWithCourseRequests = (hookFn) => renderHook(hookFn, {
  wrapper: ({ children }) => (
    <SubsidyRequestsContext.Provider value={requestsEnabled}>
      <IntlProvider locale="en" messages={{}}>
        {children}
      </IntlProvider>
    </SubsidyRequestsContext.Provider>
  ),
});

describe('AdministerSubscriptionsFlow', () => {
  const mockHandleEndTour = jest.fn();
  const enterpriseId = 'enterprise-id';
  const mockSetCurrentStep = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Main subscription page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'subscriptions',
      });
    });

    it('should return main subscription page flow when on main page', () => {
      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current).toHaveLength(3);
      expect(result.current[0].target).toBe('#subscriptions-sidebar');
      expect(result.current[1].target).toBe('#subscription-plans-list');
      expect(result.current[2].target).toBe('#manage-learners-button');
    });

    it('should return main subscription page flow with additional manage requests step', () => {
      const { result } = renderHookWithCourseRequests(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current).toHaveLength(4);
      expect(result.current[0].target).toBe('#subscriptions-sidebar');
      expect(result.current[1].target).toBe('#subscription-plans-list');
      expect(result.current[2].target).toBe('#tabs-subscription-management-tab-manage-requests');
      expect(result.current[3].target).toBe('#manage-learners-button');
    });

    it('should have correct step properties for main flow', () => {
      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current[0].title).toBe('Administer subscriptions');
      expect(result.current[0].placement).toBe('right');
      expect(typeof result.current[0].onAdvance).toBe('function');

      expect(result.current[1].title).toBeUndefined();
      expect(result.current[1].placement).toBe('top');
      expect(typeof result.current[1].onAdvance).toBe('function');

      expect(result.current[2].placement).toBe('left');
      expect(typeof result.current[2].onEnd).toBe('function');
    });

    it('should have correct step properties for main flow with requests', () => {
      const { result } = renderHookWithCourseRequests(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current[0].title).toBe('Administer subscriptions');
      expect(result.current[0].placement).toBe('right');
      expect(typeof result.current[0].onAdvance).toBe('function');

      expect(result.current[1].title).toBeUndefined();
      expect(result.current[1].placement).toBe('top');
      expect(typeof result.current[1].onAdvance).toBe('function');

      expect(result.current[2].title).toBeUndefined();
      expect(result.current[2].placement).toBe('bottom');
      expect(typeof result.current[2].onAdvance).toBe('function');

      expect(result.current[3].placement).toBe('left');
      expect(typeof result.current[3].onEnd).toBe('function');
    });
  });

  it('should call handleAdvanceTour on intermediate steps', () => {
    const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
      currentStep: 0,
      enterpriseId,
      enterpriseSlug: enterpriseId,
      handleEndTour: mockHandleEndTour,
      setCurrentStep: mockSetCurrentStep,
      targetSelector: '',
    }));

    act(() => {
      result.current[0].onAdvance();
    });
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(enterpriseId, ADMIN_TOUR_EVENT_NAMES.ADMINISTER_SUBSCRIPTIONS_ADVANCE_EVENT_NAME, { 'completed-step': 1 });
  });

  describe('Detail subscription page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/test-subscription-uuid',
      });
    });

    it('should return subscription detail page flow when on detail page', () => {
      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#subscription-plans-detail-page');
      expect(result.current[1].target).toBe('#invite-learners-button');
      expect(result.current[2].target).toBe('#license-allocation-section');
      expect(result.current[3].target).toBe('#license-allocation-filters');
      expect(result.current[4].target).toBe('#subscription-navigation');
    });

    it('should have correct step properties for detail flow', () => {
      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      result.current.slice(0, -1).forEach((step) => {
        expect(typeof step.onAdvance).toBe('function');
        expect(step.onEnd).toBeUndefined();
      });

      const lastStep = result.current[4];
      expect(typeof lastStep.onEnd).toBe('function');
      expect(lastStep.onAdvance).toBeUndefined();
    });

    it('should call handleEndTour on the final step', () => {
      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      act(() => {
        result.current[4].onEnd();
      });
      expect(mockHandleEndTour).toHaveBeenCalledTimes(1);
    });
  });

  describe('Page detection', () => {
    it('should detect main page when no subscription UUID in URL', () => {
      useParams.mockReturnValue({
        '*': 'subscriptions',
      });

      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current).toHaveLength(3);
      expect(result.current[0].target).toBe('#subscriptions-sidebar');
    });

    it('should detect detail page when subscription UUID is in URL', () => {
      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/test-uuid',
      });

      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#subscription-plans-detail-page');
    });

    it('should handle URL params with different patterns', () => {
      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/uuid-123/extra-segment',
      });

      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#subscription-plans-detail-page');
    });

    it('should handle undefined URL params', () => {
      useParams.mockReturnValue({
        '*': undefined,
      });

      const { result } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      expect(result.current).toHaveLength(3);
      expect(result.current[0].target).toBe('#subscriptions-sidebar');
    });
  });

  describe('Flow integration', () => {
    it('should have correct step progression from main to detail flow', () => {
      useParams.mockReturnValue({
        '*': 'subscriptions',
      });

      const { result: mainFlow } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));

      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/test-uuid',
      });
      const { result: detailFlow } = renderHookWithIntl(() => AdministerSubscriptionsFlow({
        currentStep: 0,
        enterpriseId,
        enterpriseSlug: enterpriseId,
        handleEndTour: mockHandleEndTour,
        setCurrentStep: mockSetCurrentStep,
        targetSelector: '',
      }));
      expect(mainFlow.current).toHaveLength(3);

      expect(detailFlow.current).toHaveLength(5);

      const lastMainStep = mainFlow.current[2];
      expect(lastMainStep.target).toBe('#manage-learners-button');
      expect(typeof lastMainStep.onEnd).toBe('function');

      const firstDetailStep = detailFlow.current[0];
      expect(firstDetailStep.target).toBe('#subscription-plans-detail-page');
    });
  });
});

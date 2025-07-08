import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useParams } from 'react-router';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import useAdministerSubscriptionsFlow from '../useAdministerSubscriptionsFlow';

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../messages', () => ({
  administerSubscriptionsTitle: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.title',
    defaultMessage: 'Administer subscriptions',
  },
  administerSubscriptionsStepOneBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.1',
    defaultMessage: 'Manage your subscription plans and give learners access to self-enroll in courses.',
  },
  administerSubscriptionsStepTwoBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.2',
    defaultMessage: 'The list below shows active and expired subscription plans.',
  },
  administerSubscriptionsStepThreeBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.3',
    defaultMessage: '"Manage learners" allows you to view more details about a plan.',
  },
  administerSubscriptionsStepFourBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.4',
    defaultMessage: 'On the subscription plan details page, you can check the expiration date.',
  },
  administerSubscriptionsStepFiveBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.5',
    defaultMessage: '"Invite Learners" allows you to invite learners to your subscription plan.',
  },
  administerSubscriptionsStepSixBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.6',
    defaultMessage: 'The License Allocation section lets you see invited learners.',
  },
  administerSubscriptionsStepSevenBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.7',
    defaultMessage: 'Use filters to sort invited learners by license status.',
  },
  administerSubscriptionsStepEightBody: {
    id: 'adminPortal.productTours.adminOnboarding.administerSubscriptions.body.8',
    defaultMessage: 'To view more plans, navigate back to Subscription Management.',
  },
}));

const renderHookWithIntl = (hookFn) => renderHook(hookFn, {
  wrapper: ({ children }) => (
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  ),
});

describe('useAdministerSubscriptionsFlow', () => {
  const mockHandleAdvanceTour = jest.fn();
  const mockHandleEndTour = jest.fn();

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
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current).toHaveLength(3);
      expect(result.current[0].target).toBe('#subscriptions-sidebar');
      expect(result.current[1].target).toBe('#subscription-plans-list');
      expect(result.current[2].target).toBe('#manage-learners-button');
    });

    it('should have correct step properties for main flow', () => {
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current[0].title).toBe('Administer subscriptions');
      expect(result.current[0].placement).toBe('right');
      expect(result.current[0].onAdvance).toBe(mockHandleAdvanceTour);

      expect(result.current[1].title).toBeUndefined();
      expect(result.current[1].placement).toBe('top');
      expect(result.current[1].onAdvance).toBe(mockHandleAdvanceTour);

      expect(result.current[2].placement).toBe('left');
      expect(result.current[2].onEnd).toBe(mockHandleAdvanceTour);
    });

    it('should call handleAdvanceTour on intermediate steps', () => {
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      act(() => {
        result.current[0].onAdvance();
      });
      expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(1);

      act(() => {
        result.current[1].onAdvance();
      });
      expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(2);
    });

    it('should call handleAdvanceTour on the final step (manage learners button)', () => {
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      act(() => {
        result.current[2].onEnd();
      });
      expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(1);
    });
  });

  describe('Detail subscription page flow', () => {
    beforeEach(() => {
      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/test-subscription-uuid',
      });
    });

    it('should return subscription detail page flow when on detail page', () => {
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#subscription-plans-detail-page');
      expect(result.current[1].target).toBe('#invite-learners-button');
      expect(result.current[2].target).toBe('#license-allocation-section');
      expect(result.current[3].target).toBe('.pgn__data-table-layout-sidebar');
      expect(result.current[4].target).toBe('#subscription-navigation');
    });

    it('should have correct step properties for detail flow', () => {
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      result.current.slice(0, -1).forEach((step) => {
        expect(step.onAdvance).toBe(mockHandleAdvanceTour);
        expect(step.onEnd).toBeUndefined();
      });

      const lastStep = result.current[4];
      expect(lastStep.onAdvance).toBe(mockHandleEndTour);
      expect(lastStep.onEnd).toBeUndefined();
    });

    it('should call handleAdvanceTour on intermediate steps', () => {
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      act(() => {
        result.current[0].onAdvance();
      });
      expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(1);

      act(() => {
        result.current[1].onAdvance();
      });
      expect(mockHandleAdvanceTour).toHaveBeenCalledTimes(2);
    });

    it('should call handleEndTour on the final step', () => {
      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      act(() => {
        result.current[4].onAdvance();
      });
      expect(mockHandleEndTour).toHaveBeenCalledTimes(1);
    });
  });

  describe('Page detection', () => {
    it('should detect main page when no subscription UUID in URL', () => {
      useParams.mockReturnValue({
        '*': 'subscriptions',
      });

      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current).toHaveLength(3);
      expect(result.current[0].target).toBe('#subscriptions-sidebar');
    });

    it('should detect detail page when subscription UUID is in URL', () => {
      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/test-uuid',
      });

      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#subscription-plans-detail-page');
    });

    it('should handle URL params with different patterns', () => {
      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/uuid-123/extra-segment',
      });

      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      expect(result.current).toHaveLength(5);
      expect(result.current[0].target).toBe('#subscription-plans-detail-page');
    });

    it('should handle undefined URL params', () => {
      useParams.mockReturnValue({
        '*': undefined,
      });

      const { result } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
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

      const { result: mainFlow } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }));

      useParams.mockReturnValue({
        '*': 'subscriptions/manage-learners/test-uuid',
      });
      const { result: detailFlow } = renderHookWithIntl(() => useAdministerSubscriptionsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
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

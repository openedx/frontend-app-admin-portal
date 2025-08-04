import { act, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import useAdminOnboardingTour from '../flows/AdminOnboardingTour';
import { ADMIN_TOUR_EVENT_NAMES } from '../constants';
import useHydrateAdminOnboardingData from '../data/useHydrateAdminOnboardingData';
import { queryClient } from '../../../test/testUtils';

const mockMessages = {
  collapsibleTitle: {
    id: 'admin.portal.productTours.collapsible.title',
    defaultMessage: 'Quick Start Guide',
  },
  learnerProgressTitle: {
    id: 'admin.portal.productTours.learnerProgress.title',
    defaultMessage: 'Track learner progress',
  },
  learnerProgressBody: {
    id: 'admin.portal.productTours.learnerProgress.body',
    defaultMessage: 'Track learner activity and progress.',
  },
};

jest.mock('../data/useHydrateAdminOnboardingData');

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage,
  }),
  FormattedMessage: ({ defaultMessage, id }) => {
    const message = mockMessages[id] || { defaultMessage };
    return message.defaultMessage;
  },
  defineMessages: (messages) => messages,
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useAdminOnboardingTour', () => {
  const defaultProps = {
    currentStep: 0,
    setCurrentStep: jest.fn(),
    enterpriseSlug: 'test-enterprise',
  };

  beforeEach(() => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });
  });

  it('returns tour configuration with correct structure', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps), { wrapper });
    expect(result.current.length === 7);
  });

  it('includes title and body with FormattedMessage components', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps), { wrapper });
    expect(result.current[0].title).toBeDefined();
    expect(result.current[0].body).toBeDefined();
  });

  it('includes onAdvance function', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps), { wrapper });
    expect(typeof result.current[0].onAdvance).toBe('function');
  });

  it('handles missing enterpriseSlug gracefully', () => {
    const { result } = renderHook(() => useAdminOnboardingTour({}), { wrapper });

    expect(result.current[0]).toBeDefined();
  });

  it('returns all required properties', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps), { wrapper });
    const requiredProps = [
      'target',
      'title',
      'body',
      'placement',
      'onAdvance',
    ];

    requiredProps.forEach(prop => {
      expect(result.current[0]).toHaveProperty(prop);
    });
  });

  it('should call sendEnterpriseTrackEvent with correct parameters when tour advances', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps), { wrapper });

    const firstStep = result.current[0];

    act(() => {
      firstStep.onAdvance();
    });

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      defaultProps.enterpriseSlug,
      ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME,
      { 'completed-step': 1 },
    );
  });

  it('should call sendEnterpriseTrackEvent with correct parameters when tour advances', () => {
    const props = {
      currentStep: 2,
      setCurrentStep: jest.fn(),
      enterpriseSlug: 'test-enterprise',
    };
    const { result } = renderHook(() => useAdminOnboardingTour(props), { wrapper });

    const secondStep = result.current[1];

    act(() => {
      secondStep.onBack();
    });

    expect(sendEnterpriseTrackEvent).toHaveBeenLastCalledWith(
      defaultProps.enterpriseSlug,
      ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_BACK_EVENT_NAME,
      { 'back-step': 1 },
    );
  });
});

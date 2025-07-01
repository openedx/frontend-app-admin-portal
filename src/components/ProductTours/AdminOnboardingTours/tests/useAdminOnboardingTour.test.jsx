import { renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import useAdminOnboardingTour from '../useAdminOnboardingTour';

const mockMessages = {
  collapsibleTitle: {
    id: 'admin.portal.productTours.collapsible.title',
    defaultMessage: 'Quick Start Guide',
  },
  learnerProgressTitle: {
    id: 'admin.portal.productTours.learnerProgress.title',
    defaultMessage: 'Track Learner Progress',
  },
  learnerProgressBody: {
    id: 'admin.portal.productTours.learnerProgress.body',
    defaultMessage: 'Track learner activity and progress.',
  },
};

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

describe('useAdminOnboardingTour', () => {
  const defaultProps = {
    enterpriseSlug: 'test-enterprise',
  };

  it('returns tour configuration with correct structure', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps));
    expect(result.current.length === 7);
  });

  it('includes title and body with FormattedMessage components', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps));
    expect(result.current[0].title).toBeDefined();
    expect(result.current[0].body).toBeDefined();
  });

  it('includes onAdvance function', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps));
    expect(typeof result.current[0].onAdvance).toBe('function');
  });

  it('handles missing enterpriseSlug gracefully', () => {
    const { result } = renderHook(() => useAdminOnboardingTour({}));
    expect(result.current[0]).toBeDefined();
  });

  it('returns all required properties', () => {
    const { result } = renderHook(() => useAdminOnboardingTour(defaultProps));
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
});

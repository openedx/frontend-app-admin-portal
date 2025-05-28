import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import useLearnerProgressTour from '../useLearnerProgressTour';

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

describe('useLearnerProgressTour', () => {
  const defaultProps = {
    enterpriseSlug: 'test-enterprise',
  };

  it('returns tour configuration with correct structure', () => {
    const { result } = renderHook(() => useLearnerProgressTour(defaultProps));

    expect(result.current).toMatchObject({
      target: '#learner-progress-sidebar',
      placement: 'right',
    });
  });

  it('includes title and body with FormattedMessage components', () => {
    const { result } = renderHook(() => useLearnerProgressTour(defaultProps));

    expect(result.current.title).toBeDefined();
    expect(result.current.body).toBeDefined();
  });

  it('includes onAdvance function', () => {
    const { result } = renderHook(() => useLearnerProgressTour(defaultProps));

    expect(typeof result.current.onAdvance).toBe('function');
  });

  it('handles missing enterpriseSlug gracefully', () => {
    const { result } = renderHook(() => useLearnerProgressTour({}));

    expect(result.current).toBeDefined();
  });

  it('returns all required properties', () => {
    const { result } = renderHook(() => useLearnerProgressTour(defaultProps));
    const requiredProps = [
      'target',
      'title',
      'body',
      'placement',
      'onAdvance',
    ];

    requiredProps.forEach(prop => {
      expect(result.current).toHaveProperty(prop);
    });
  });
});

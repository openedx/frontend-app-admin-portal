import learnerProgressTour from '../learnerProgressTour';

jest.mock('@edx/frontend-platform/i18n', () => ({
  FormattedMessage: ({ defaultMessage }) => defaultMessage,
}));

describe('learnerProgressTour', () => {
  const mockEnterpriseSlug = 'test-enterprise';
  const mockProps = {
    enterpriseSlug: mockEnterpriseSlug,
  };

  it('returns a tour configuration object', () => {
    const tourConfig = learnerProgressTour(mockProps);
    expect(tourConfig).toBeDefined();
    expect(typeof tourConfig).toBe('object');
  });

  it('includes correct target selector', () => {
    const tourConfig = learnerProgressTour(mockProps);
    expect(tourConfig.target).toBe('#learner-progress-sidebar');
  });

  it('includes correct title', () => {
    const tourConfig = learnerProgressTour(mockProps);
    expect(tourConfig.title.props.defaultMessage).toBe('Track Learner Progress');
  });

  it('includes correct placement', () => {
    const tourConfig = learnerProgressTour(mockProps);
    expect(tourConfig.placement).toBe('right');
  });

  it('includes onAdvance function', () => {
    const tourConfig = learnerProgressTour(mockProps);
    expect(typeof tourConfig.onAdvance).toBe('function');
  });

  it('includes all required properties', () => {
    const tourConfig = learnerProgressTour(mockProps);
    const requiredProps = [
      'target',
      'title',
      'body',
      'placement',
      'onAdvance',
    ];

    requiredProps.forEach(prop => {
      expect(tourConfig).toHaveProperty(prop);
    });
  });
});

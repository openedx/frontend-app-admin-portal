import React from 'react';
import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import useCreateLearnerProgressFlow from '../useCreateLearnerProgressFlow';
import useCreateAnalyticsFlow from '../useCreateAnalyticsFlow';
import { ANALYTICS_INSIGHTS_FLOW } from '../constants';
import messages from '../messages';

const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id || 'Mocked message');

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: mockFormatMessage,
  }),
}));

const wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

const mockHandleAdvanceTour = jest.fn();
const mockHandleEndTour = jest.fn();

describe('useCreateAnalyticsFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates analytics flow with correct structure', () => {
    const { result } = renderHook(
      () => useCreateAnalyticsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        aiButtonVisible: false,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow).toHaveLength(6);

    expect(flow[0]).toEqual({
      target: `#${ANALYTICS_INSIGHTS_FLOW.SIDEBAR}`,
      placement: 'right',
      title: messages.viewEnrollmentInsights.defaultMessage,
      body: messages.viewEnrollmentInsightsStepOneBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[1]).toEqual({
      target: `#${ANALYTICS_INSIGHTS_FLOW.DATE_RANGE}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepTwoBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[2]).toEqual({
      target: `#${ANALYTICS_INSIGHTS_FLOW.METRICS}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepThreeBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[3]).toEqual({
      target: `.${ANALYTICS_INSIGHTS_FLOW.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepFourBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[4]).toEqual({
      target: `#${ANALYTICS_INSIGHTS_FLOW.LEADERBOARD}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepFiveBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[5]).toEqual({
      target: `#${ANALYTICS_INSIGHTS_FLOW.SKILLS}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepSixBody.defaultMessage,
      onAdvance: mockHandleEndTour,
    });
  });

  it('uses correct target selectors for analytics flow', () => {
    const { result } = renderHook(
      () => useCreateAnalyticsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        aiButtonVisible: false,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow[0].target).toBe(`#${ANALYTICS_INSIGHTS_FLOW.SIDEBAR}`);
    expect(flow[1].target).toBe(`#${ANALYTICS_INSIGHTS_FLOW.DATE_RANGE}`);
    expect(flow[2].target).toBe(`#${ANALYTICS_INSIGHTS_FLOW.METRICS}`);
    expect(flow[3].target).toBe(`.${ANALYTICS_INSIGHTS_FLOW.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`);
    expect(flow[4].target).toBe(`#${ANALYTICS_INSIGHTS_FLOW.LEADERBOARD}`);
    expect(flow[5].target).toBe(`#${ANALYTICS_INSIGHTS_FLOW.SKILLS}`);
  });
});

describe('function behavior', () => {
  it('returns different function references for onAdvance and onEndTour', () => {
    const { result: learnerFlow } = renderHook(
      () => useCreateLearnerProgressFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        aiButtonVisible: false,
      }),
      { wrapper },
    );

    const { result: analyticsFlow } = renderHook(
      () => useCreateAnalyticsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        aiButtonVisible: false,
      }),
      { wrapper },
    );

    expect(learnerFlow.current[0].onAdvance).toBe(mockHandleAdvanceTour);
    expect(analyticsFlow.current[0].onAdvance).toBe(mockHandleAdvanceTour);

    expect(learnerFlow.current[6].onAdvance).toBe(mockHandleEndTour);
    expect(analyticsFlow.current[5].onAdvance).toBe(mockHandleEndTour);
  });

  it('maintains correct step order in both flows', () => {
    const { result: learnerFlow } = renderHook(
      () => useCreateLearnerProgressFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        aiButtonVisible: false,
      }),
      { wrapper },
    );

    const { result: analyticsFlow } = renderHook(
      () => useCreateAnalyticsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        aiButtonVisible: false,
      }),
      { wrapper },
    );

    expect(learnerFlow.current).toHaveLength(7);

    expect(analyticsFlow.current).toHaveLength(6);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    learnerFlow.current.forEach((step, _) => {
      expect(step).toHaveProperty('target');
      expect(step).toHaveProperty('placement');
      expect(step).toHaveProperty('body');
      expect(step).toHaveProperty('onAdvance');
      expect(typeof step.onAdvance).toBe('function');
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    analyticsFlow.current.forEach((step, _) => {
      expect(step).toHaveProperty('target');
      expect(step).toHaveProperty('placement');
      expect(step).toHaveProperty('body');
      expect(step).toHaveProperty('onAdvance');
      expect(typeof step.onAdvance).toBe('function');
    });
  });
});

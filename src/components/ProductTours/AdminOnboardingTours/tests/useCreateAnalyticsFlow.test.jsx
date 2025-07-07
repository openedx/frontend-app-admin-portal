import React from 'react';
import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import useCreateAnalyticsFlow from '../data/useCreateAnalyticsFlow';
import { ANALYTICS_INSIGHTS_TARGETS } from '../constants';
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

    // can't test equality of onAdvance since it's an anonymous function
    expect(flow[0]).toMatchObject({
      target: `#${ANALYTICS_INSIGHTS_TARGETS.SIDEBAR}`,
      placement: 'right',
      title: messages.viewEnrollmentInsights.defaultMessage,
      body: messages.viewEnrollmentInsightsStepOneBody.defaultMessage,
    });

    expect(flow[1]).toMatchObject({
      target: `#${ANALYTICS_INSIGHTS_TARGETS.DATE_RANGE}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepTwoBody.defaultMessage,
    });

    expect(flow[2]).toMatchObject({
      target: `#${ANALYTICS_INSIGHTS_TARGETS.METRICS}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepThreeBody.defaultMessage,
    });

    expect(flow[3]).toMatchObject({
      target: `.${ANALYTICS_INSIGHTS_TARGETS.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepFourBody.defaultMessage,
    });

    expect(flow[4]).toMatchObject({
      target: `#${ANALYTICS_INSIGHTS_TARGETS.LEADERBOARD}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepFiveBody.defaultMessage,
    });

    expect(flow[5]).toMatchObject({
      target: `#${ANALYTICS_INSIGHTS_TARGETS.SKILLS}`,
      placement: 'top',
      body: messages.viewEnrollmentInsightsStepSixBody.defaultMessage,
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

    expect(flow[0].target).toBe(`#${ANALYTICS_INSIGHTS_TARGETS.SIDEBAR}`);
    expect(flow[1].target).toBe(`#${ANALYTICS_INSIGHTS_TARGETS.DATE_RANGE}`);
    expect(flow[2].target).toBe(`#${ANALYTICS_INSIGHTS_TARGETS.METRICS}`);
    expect(flow[3].target).toBe(`.${ANALYTICS_INSIGHTS_TARGETS.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`);
    expect(flow[4].target).toBe(`#${ANALYTICS_INSIGHTS_TARGETS.LEADERBOARD}`);
    expect(flow[5].target).toBe(`#${ANALYTICS_INSIGHTS_TARGETS.SKILLS}`);
  });
});

describe('function behavior', () => {
  it('returns different function references for onAdvance and onEndTour', () => {
    const { result: analyticsFlow } = renderHook(
      () => useCreateAnalyticsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );
    expect(analyticsFlow.current[0].onAdvance).not.toEqual(analyticsFlow.current[5].onAdvance);
  });

  it('maintains correct step order in analytics flows', () => {
    const { result: analyticsFlow } = renderHook(
      () => useCreateAnalyticsFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        aiButtonVisible: false,
      }),
      { wrapper },
    );

    expect(analyticsFlow.current).toHaveLength(6);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    analyticsFlow.current.forEach((step, _) => {
      expect(step).toHaveProperty('target');
      expect(step).toHaveProperty('placement');
      expect(step).toHaveProperty('body');
    });

    expect(analyticsFlow.current[0]).toHaveProperty('onAdvance');
    expect(analyticsFlow.current[5]).toHaveProperty('onEnd');
  });
});

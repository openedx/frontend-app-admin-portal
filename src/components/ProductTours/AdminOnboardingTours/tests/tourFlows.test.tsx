import React from 'react';
import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useCreateLearnerProgressFlow, useCreateAnalyticsFlow } from '../tourFlows';
import { TRACK_LEARNER_PROGRESS_TARGETS } from '../constants';
import messages from '../messages';

const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id || 'Mocked message');

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: mockFormatMessage,
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

describe('tourFlows', () => {
  const mockHandleAdvanceTour = jest.fn();
  const mockHandleEndTour = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCreateLearnerProgressFlow', () => {
    it('creates learner progress flow with correct structure when AI button is not visible', () => {
      const { result } = renderHook(
        () => useCreateLearnerProgressFlow({
          handleAdvanceTour: mockHandleAdvanceTour,
          handleEndTour: mockHandleEndTour,
          aiButtonVisible: false,
        }),
        { wrapper },
      );

      const flow = result.current;

      expect(flow).toHaveLength(7);
      expect(flow[0]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR}`,
        placement: 'right',
        title: messages.trackLearnerProgressStepOneTitle.defaultMessage,
        body: messages.trackLearnerProgressStepOneBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[1]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}`,
        placement: 'bottom',
        body: messages.trackLearnerProgressStepTwoBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[2]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}`,
        placement: 'top',
        body: messages.trackLearnerProgressStepFourBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[3]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FULL_PROGRESS_REPORT}`,
        placement: 'top',
        body: messages.trackLearnerProgressStepFiveBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[4]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FILTER}`,
        placement: 'top',
        body: messages.trackLearnerProgressStepSixBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[5]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.CSV_DOWNLOAD}`,
        placement: 'top',
        body: messages.trackLearnerProgressStepSevenBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[6]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}`,
        placement: 'top',
        body: messages.trackLearnerProgressStepEightBody.defaultMessage,
        onAdvance: mockHandleEndTour,
      });
    });

    it('creates learner progress flow with AI button step when AI button is visible', () => {
      const { result } = renderHook(
        () => useCreateLearnerProgressFlow({
          handleAdvanceTour: mockHandleAdvanceTour,
          handleEndTour: mockHandleEndTour,
          aiButtonVisible: true,
        }),
        { wrapper },
      );

      const flow = result.current;

      expect(flow).toHaveLength(8);

      expect(flow[0].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR}`);
      expect(flow[1].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}`);

      expect(flow[2]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.AI_SUMMARY}`,
        placement: 'right',
        body: messages.trackLearnerProgressStepThreeBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[3].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}`);

      expect(flow[7].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}`);
      expect(flow[7].onAdvance).toBe(mockHandleEndTour);
    });

    it('calls formatMessage for all step messages', () => {
      renderHook(
        () => useCreateLearnerProgressFlow({
          handleAdvanceTour: mockHandleAdvanceTour,
          handleEndTour: mockHandleEndTour,
          aiButtonVisible: false,
        }),
        { wrapper },
      );

      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepOneTitle);
      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepOneBody);
      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepTwoBody);
      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepFourBody);
      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepFiveBody);
      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepSixBody);
      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepSevenBody);
      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepEightBody);
    });

    it('calls formatMessage for AI step when AI button is visible', () => {
      renderHook(
        () => useCreateLearnerProgressFlow({
          handleAdvanceTour: mockHandleAdvanceTour,
          handleEndTour: mockHandleEndTour,
          aiButtonVisible: true,
        }),
        { wrapper },
      );

      expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepThreeBody);
    });
  });

  describe('useCreateAnalyticsFlow', () => {
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
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.SIDEBAR}`,
        placement: 'right',
        title: messages.viewEnrollmentInsights.defaultMessage,
        body: messages.viewEnrollmentInsightsStepOneBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[1]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.DATE_RANGE}`,
        placement: 'top',
        body: messages.viewEnrollmentInsightsStepTwoBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[2]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.METRICS}`,
        placement: 'top',
        body: messages.viewEnrollmentInsightsStepThreeBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[3]).toEqual({
        target: `.${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`,
        placement: 'top',
        body: messages.viewEnrollmentInsightsStepFourBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[4]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.LEADERBOARD}`,
        placement: 'top',
        body: messages.viewEnrollmentInsightsStepFiveBody.defaultMessage,
        onAdvance: mockHandleAdvanceTour,
      });

      expect(flow[5]).toEqual({
        target: `#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.SKILLS}`,
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

      expect(flow[3].target).toBe(`.${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.ENROLLMENTS_ENGAGEMENTS_COMPLETIONS}`);

      expect(flow[0].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.SIDEBAR}`);
      expect(flow[1].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.DATE_RANGE}`);
      expect(flow[2].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.METRICS}`);
      expect(flow[4].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.LEADERBOARD}`);
      expect(flow[5].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.ANALYTICS_INSIGHTS_FLOW.SKILLS}`);
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
      learnerFlow.current.forEach((step, index) => {
        expect(step).toHaveProperty('target');
        expect(step).toHaveProperty('placement');
        expect(step).toHaveProperty('body');
        expect(step).toHaveProperty('onAdvance');
        expect(typeof step.onAdvance).toBe('function');
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      analyticsFlow.current.forEach((step, index) => {
        expect(step).toHaveProperty('target');
        expect(step).toHaveProperty('placement');
        expect(step).toHaveProperty('body');
        expect(step).toHaveProperty('onAdvance');
        expect(typeof step.onAdvance).toBe('function');
      });
    });
  });
});

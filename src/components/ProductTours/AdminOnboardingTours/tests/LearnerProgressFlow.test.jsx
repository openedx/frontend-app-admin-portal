import React from 'react';
import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import useCreateLearnerProgressFlow from '../flows/LearnerProgressFlow';
import { TRACK_LEARNER_PROGRESS_TARGETS } from '../constants';
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

describe('tourFlows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates learner progress flow with correct structure when AI button is not visible', () => {
    const { result } = renderHook(
      () => useCreateLearnerProgressFlow({
        aiButtonVisible: false,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow).toHaveLength(7);
    // can't test equality of onAdvance since it's an anonymous function
    expect(flow[0]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR}`,
      placement: 'right',
      title: messages.trackLearnerProgressStepOneTitle.defaultMessage,
      body: messages.trackLearnerProgressStepOneBody.defaultMessage,
    });

    expect(flow[1]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}`,
      placement: 'bottom',
      body: messages.trackLearnerProgressStepTwoBody.defaultMessage,
    });

    expect(flow[2]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}`,
      placement: 'top',
      body: messages.trackLearnerProgressStepFourBody.defaultMessage,
    });

    expect(flow[3]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FULL_PROGRESS_REPORT}`,
      placement: 'top',
      body: messages.trackLearnerProgressStepFiveBody.defaultMessage,
    });

    expect(flow[4]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.FILTER}`,
      placement: 'top',
      body: messages.trackLearnerProgressStepSixBody.defaultMessage,
    });

    expect(flow[5]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.CSV_DOWNLOAD}`,
      placement: 'top',
      body: messages.trackLearnerProgressStepSevenBody.defaultMessage,
    });

    expect(flow[6]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}`,
      placement: 'top',
      body: messages.trackLearnerProgressStepEightBody.defaultMessage,
    });
  });

  it('creates learner progress flow with AI button step when AI button is visible', () => {
    const { result } = renderHook(
      () => useCreateLearnerProgressFlow({
        aiButtonVisible: true,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow).toHaveLength(8);

    expect(flow[0].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.LEARNER_PROGRESS_SIDEBAR}`);
    expect(flow[1].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.LPR_OVERVIEW}`);

    expect(flow[2]).toMatchObject({
      target: `#${TRACK_LEARNER_PROGRESS_TARGETS.AI_SUMMARY}`,
      placement: 'right',
      body: messages.trackLearnerProgressStepThreeBody.defaultMessage,
    });

    expect(flow[3].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.PROGRESS_REPORT}`);
    expect(flow[7].target).toBe(`#${TRACK_LEARNER_PROGRESS_TARGETS.MODULE_ACTIVITY}`);
  });

  it('calls formatMessage for all step messages', () => {
    renderHook(
      () => useCreateLearnerProgressFlow({
        aiButtonVisible: false,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
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
        aiButtonVisible: true,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    expect(mockFormatMessage).toHaveBeenCalledWith(messages.trackLearnerProgressStepThreeBody);
  });
});

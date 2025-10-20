import analyticsFlow from '../flows/AnalyticsV2Flow';
import { ANALYTICS_V2_TARGETS } from '../constants';
import messages from '../messages';

const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id || 'Mocked message');

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: mockFormatMessage,
  }),
}));

const mockHandleAdvanceTour = jest.fn();
const mockHandleEndTour = jest.fn();

describe('analyticsFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates analytics flow with correct structure', () => {
    const flow = analyticsFlow({
      handleAdvanceTour: mockHandleAdvanceTour,
      handleEndTour: mockHandleEndTour,
    });

    expect(flow).toHaveLength(4);

    // can't test equality of onAdvance since it's an anonymous function
    expect(flow[0]).toMatchObject({
      target: `#${ANALYTICS_V2_TARGETS.SIDEBAR}`,
      placement: 'right',
      title: messages.analyticsStepOneTitle.defaultMessage,
      body: messages.analyticsStepOneBody.defaultMessage,
    });

    expect(flow[1]).toMatchObject({
      target: `#${ANALYTICS_V2_TARGETS.ENGAGEMENTS_TAB}`,
      placement: 'bottom',
      body: messages.analyticsStepTwoBody.defaultMessage,
    });

    expect(flow[2]).toMatchObject({
      target: `#${ANALYTICS_V2_TARGETS.PROGRESS_TAB}`,
      placement: 'bottom',
      body: messages.analyticsStepThreeBody.defaultMessage,
    });

    expect(flow[3]).toMatchObject({
      target: `#${ANALYTICS_V2_TARGETS.OUTCOMES_TAB}`,
      placement: 'bottom',
      body: messages.analyticsStepFourBody.defaultMessage,
    });
  });

  it('uses correct target selectors for analytics flow', () => {
    const flow = analyticsFlow({
      handleAdvanceTour: mockHandleAdvanceTour,
      handleEndTour: mockHandleEndTour,
    });

    expect(flow[0].target).toBe(`#${ANALYTICS_V2_TARGETS.SIDEBAR}`);
    expect(flow[1].target).toBe(`#${ANALYTICS_V2_TARGETS.ENGAGEMENTS_TAB}`);
    expect(flow[2].target).toBe(`#${ANALYTICS_V2_TARGETS.PROGRESS_TAB}`);
    expect(flow[3].target).toBe(`#${ANALYTICS_V2_TARGETS.OUTCOMES_TAB}`);
  });
});

describe('function behavior', () => {
  it('maintains correct step order in analytics flows', () => {
    const flow = analyticsFlow({
      handleAdvanceTour: mockHandleAdvanceTour,
      handleEndTour: mockHandleEndTour,
    });

    expect(flow).toHaveLength(4);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    flow.forEach((step, _) => {
      expect(step).toHaveProperty('target');
      expect(step).toHaveProperty('placement');
      expect(step).toHaveProperty('body');
    });

    expect(flow[0]).toHaveProperty('onAdvance');
    expect(flow[3]).toHaveProperty('onEnd');
  });
});

import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import useCreateOrganizeLearnersFlow from '../data/useCreateOrganizeLearnersFlow';
import { ORGANIZE_LEARNER_TARGETS } from '../constants';
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

describe('useCreateOrganizeLearnersFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockHandleAdvanceTour = jest.fn();
  const mockHandleEndTour = jest.fn();

  it('creates organize learners flow with correct structure', () => {
    const { result } = renderHook(
      () => useCreateOrganizeLearnersFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow).toHaveLength(6);

    expect(flow[0]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
      placement: 'right',
      title: messages.organizeLearnersStepOneTitle.defaultMessage,
      body: messages.organizeLearnersStepOneBody.defaultMessage,
    });
    expect(flow[1]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS_ZERO_STATE}`,
      placement: 'top',
      body: messages.organizeLearnersStepTwoBody.defaultMessage,
    });
    expect(flow[2]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
      placement: 'left',
      body: messages.organizeLearnersStepThreeBody.defaultMessage,
    });
    expect(flow[3]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
      placement: 'top',
      body: messages.organizeLearnersStepFourBody.defaultMessage,
    });
    expect(flow[4]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_HIGHLIGHT}`,
      placement: 'top',
      body: messages.organizeLearnersStepFiveBody.defaultMessage,
    });
    expect(flow[5]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
      placement: 'left',
      body: messages.organizeLearnersStepSixBody.defaultMessage,
    });
  });

  it('uses correct target selectors for analytics flow', () => {
    const { result } = renderHook(
      () => useCreateOrganizeLearnersFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow[0].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`);
    expect(flow[1].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS_ZERO_STATE}`);
    expect(flow[2].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`);
    expect(flow[3].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`);
    expect(flow[4].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_HIGHLIGHT}`);
    expect(flow[5].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`);
  });
  it('returns different function references for onAdvance and onEndTour', () => {
    const { result: learnerFlow } = renderHook(
      () => useCreateOrganizeLearnersFlow({
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );
    expect(learnerFlow.current[0].onAdvance).not.toEqual(learnerFlow.current[5].onAdvance);
  });
});

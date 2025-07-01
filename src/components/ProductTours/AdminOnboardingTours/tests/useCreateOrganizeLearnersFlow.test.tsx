import React from 'react';
import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import useCreateOrganizeLearnersFlow from '../useCreateOrganizeLearnersFlow';
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

const mockHandleAdvanceTour = jest.fn();
const mockHandleEndTour = jest.fn();
const testEnterpriseSlug = 'stark-enterprises';
const testEnterpriseId = '123-test-id';
const testAdminId = '123-admin-id';

describe('useCreateOrganizeLearnersFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates organize learners flow with correct structure', () => {
    const { result } = renderHook(
      () => useCreateOrganizeLearnersFlow({
        enterpriseSlug: testEnterpriseSlug,
        adminUuid: testAdminId,
        enterpriseId: testEnterpriseId,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow).toHaveLength(6);

    expect(flow[0]).toEqual({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORGANIZE_LEARNERS_SIDEBAR}`,
      placement: 'right',
      title: messages.organizeLearnersStepOneTitle.defaultMessage,
      body: messages.organizeLearnersStepOneBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[1]).toEqual({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS_ZERO_STATE}`,
      placement: 'top',
      body: messages.organizeLearnersStepTwoBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[2]).toEqual({
      target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
      placement: 'left',
      body: messages.organizeLearnersStepThreeBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[3]).toEqual({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
      placement: 'top',
      body: messages.organizeLearnersStepFourBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[4]).toEqual({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_HIGHLIGHT}`,
      placement: 'top',
      body: messages.organizeLearnersStepFiveBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[5]).toEqual({
      target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
      placement: 'left',
      body: messages.organizeLearnersStepSixBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });

    expect(flow[6]).toEqual({
      target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_DETAIL_PAGE}`,
      placement: 'top',
      body: messages.organizeLearnersStepSevenBody.defaultMessage,
      onAdvance: mockHandleAdvanceTour,
    });
  });

  it('uses correct target selectors for analytics flow', () => {
    const { result } = renderHook(
      () => useCreateOrganizeLearnersFlow({
        enterpriseSlug: testEnterpriseSlug,
        adminUuid: testAdminId,
        enterpriseId: testEnterpriseId,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow[0].target).toBe(`.${ORGANIZE_LEARNER_TARGETS.ORGANIZE_LEARNERS_SIDEBAR}`);
    expect(flow[1].target).toBe(`.${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS_ZERO_STATE}`);
    expect(flow[2].target).toBe(`.${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`);
    expect(flow[3].target).toBe(`.${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`);
    expect(flow[4].target).toBe(`.${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_HIGHLIGHT}`);
    expect(flow[5].target).toBe(`.${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`);
    expect(flow[5].target).toBe(`.${ORGANIZE_LEARNER_TARGETS.MEMBER_DETAIL_PAGE}`);
  });
});

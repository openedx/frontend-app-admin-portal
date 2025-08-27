import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import OrganizeLearnersFlow from '../flows/OrganizeLearnersFlow';
import { ORGANIZE_LEARNER_TARGETS } from '../constants';
import messages from '../messages';
import useHydrateAdminOnboardingData from '../data/useHydrateAdminOnboardingData';
import { queryClient } from '../../../test/testUtils';

const mockFormatMessage = jest.fn((message) => message.defaultMessage || message.id || 'Mocked message');

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: mockFormatMessage,
  }),
}));

jest.mock('react-router', () => ({
  useParams: jest.fn(),
}));

jest.mock('../../../learner-credit-management/data', () => ({
  ...jest.requireActual('../../../learner-credit-management/data'),
  useAllFlexEnterpriseGroups: jest.fn(),
}));

jest.mock('../data/useHydrateAdminOnboardingData');

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  </QueryClientProvider>
);

const mockHandleAdvanceTour = jest.fn();
const mockHandleEndTour = jest.fn();
const enterpriseId = 'enterprise-id';

describe('useCreateOrganizeLearnersFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({
      '*': '',
    });
  });

  it('creates organize learners flow with correct structure for no groups', () => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: false } });
    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow).toHaveLength(5);

    expect(flow[0]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
      placement: 'right',
      title: messages.organizeLearnersStepOneTitle.defaultMessage,
      body: messages.organizeLearnersStepOneBody.defaultMessage,
    });
    expect(flow[1]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
      placement: 'top',
      body: messages.organizeLearnersStepTwoBody.defaultMessage,
    });
    expect(flow[2]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
      placement: 'left',
      body: messages.organizeLearnersStepThreeBody.defaultMessage,
    });
    expect(flow[3]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}`,
      placement: 'top',
      body: messages.organizeLearnersStepFourBody.defaultMessage,
    });
    expect(flow[4]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
      placement: 'left',
    });
    expect(flow[4].body.props).toMatchObject(messages.organizeLearnersStepFiveBody);
  });

  it('uses correct target selectors for organize learners flow', () => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });
    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow[0].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`);
    expect(flow[1].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`);
    expect(flow[2].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`);
    expect(flow[3].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}`);
    expect(flow[4].target).toBe(`#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`);
  });

  it('creates organize learners flow when there are groups', () => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });
    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
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
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_MEMBER_TABLE}`,
      placement: 'top',
      body: messages.organizeLearnersStepTwoBody.defaultMessage,
    });
    expect(flow[2]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.MEMBER_VIEW_MORE}`,
      placement: 'left',
      body: messages.organizeLearnersStepThreeBody.defaultMessage,
    });
    expect(flow[3]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUPS}`,
      placement: 'top',
      body: messages.organizeLearnersWithGroupsStepFourBody.defaultMessage,
    });
    expect(flow[4]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.CREATE_GROUP_BUTTON}`,
      placement: 'left',
    });
    expect(flow[4].body.props).toMatchObject(messages.organizeLearnersWithGroupsStepFiveBody);
    expect(flow[5]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ORG_GROUP_CARD}`,
      placement: 'left',
      body: messages.organizeLearnersWithGroupsStepSixBody.defaultMessage,
    });
  });

  it('creates organize learners flow when there are no enterprise learners', () => {
    useHydrateAdminOnboardingData.mockReturnValue(
      { data: { hasEnterpriseMembers: false, hasEnterpriseGroups: false } },
    );
    useParams.mockReturnValue({
      '*': 'group-uuid',
    });
    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
      }),
      { wrapper },
    );

    const flow = result.current;
    expect(flow).toHaveLength(1);

    expect(flow[0]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.PEOPLE_MANAGEMENT_SIDEBAR}`,
      placement: 'right',
      title: messages.organizeLearnersStepOneTitle.defaultMessage,
      body: messages.organizeLearnersStepOneNoMembersBody.defaultMessage,
    });
  });
});

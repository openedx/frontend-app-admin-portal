import { renderHook } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useParams } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';

import OrganizeLearnersFlow from '../flows/OrganizeLearnersFlow';
import {
  ADMIN_TOUR_EVENT_NAMES,
  ORGANIZE_LEARNER_TARGETS,
} from '../constants';
import messages from '../messages';
import useHydrateAdminOnboardingData from '../data/useHydrateAdminOnboardingData';
import {
  getPeopleManagementActiveTabForTour,
  setPeopleManagementTabFromTour,
} from '../../../PeopleManagement';
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
jest.mock('../../../PeopleManagement', () => ({
  getPeopleManagementActiveTabForTour: jest.fn(),
  setPeopleManagementTabFromTour: jest.fn(),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en" messages={{}}>
      {children}
    </IntlProvider>
  </QueryClientProvider>
);

const mockHandleAdvanceTour = jest.fn();
const mockHandleEndTour = jest.fn();
const mockHandleBackTour = jest.fn();
const enterpriseId = 'enterprise-id';

describe('useCreateOrganizeLearnersFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getPeopleManagementActiveTabForTour.mockReturnValue('learners');
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

  it('adds admins tab as second step when invite admins is enabled', () => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });
    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        enableInviteAdmins: true,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        handleBackTour: mockHandleBackTour,
      }),
      { wrapper },
    );

    const flow = result.current;

    expect(flow).toHaveLength(7);
    expect(flow[0]).toMatchObject({
      body: messages.organizeLearnersStepOneWithAdminsBody.defaultMessage,
    });
    expect(flow[1]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ADMINS_TAB}`,
      placement: 'right',
      body: messages.organizeLearnersAdminsTabBody.defaultMessage,
    });
  });

  it('uses updated step one copy when invite admins is enabled with no groups', () => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: false } });
    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        enableInviteAdmins: true,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        handleBackTour: mockHandleBackTour,
      }),
      { wrapper },
    );

    expect(result.current[0]).toMatchObject({
      body: messages.organizeLearnersStepOneWithAdminsBody.defaultMessage,
    });
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

  it('creates terminal admins step when invite admins is enabled with no enterprise learners', () => {
    useHydrateAdminOnboardingData.mockReturnValue(
      { data: { hasEnterpriseMembers: false, hasEnterpriseGroups: false } },
    );
    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        enableInviteAdmins: true,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        handleBackTour: mockHandleBackTour,
      }),
      { wrapper },
    );

    expect(result.current).toHaveLength(2);
    expect(result.current[1]).toMatchObject({
      target: `#${ORGANIZE_LEARNER_TARGETS.ADMINS_TAB}`,
      placement: 'right',
      body: messages.organizeLearnersAdminsTabBody.defaultMessage,
    });
    expect(result.current[1].onEnd).toBeDefined();
    expect(result.current[1].onAdvance).toBeUndefined();
  });

  it('switches tabs through the People Management helper for invite-admins flow navigation', () => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });

    const { result } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        enableInviteAdmins: true,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        handleBackTour: mockHandleBackTour,
      }),
      { wrapper },
    );

    result.current[1].onAdvance();
    expect(setPeopleManagementTabFromTour).toHaveBeenCalledWith('learners');
    expect(mockHandleAdvanceTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_ADVANCE_EVENT_NAME,
    );

    result.current[2].onBack();
    expect(setPeopleManagementTabFromTour).toHaveBeenCalledTimes(1);
    expect(mockHandleBackTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_BACK_EVENT_NAME,
    );
  });

  it('restores admins tab on back when admins tab was active before advancing', () => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });
    getPeopleManagementActiveTabForTour.mockReturnValue('admins');

    const { result, rerender } = renderHook(
      () => OrganizeLearnersFlow({
        enterpriseId,
        enableInviteAdmins: true,
        handleAdvanceTour: mockHandleAdvanceTour,
        handleEndTour: mockHandleEndTour,
        handleBackTour: mockHandleBackTour,
      }),
      { wrapper },
    );

    result.current[1].onAdvance();
    rerender();
    result.current[2].onBack();

    expect(setPeopleManagementTabFromTour).toHaveBeenNthCalledWith(1, 'learners');
    expect(setPeopleManagementTabFromTour).toHaveBeenNthCalledWith(2, 'admins');
    expect(mockHandleBackTour).toHaveBeenCalledWith(
      ADMIN_TOUR_EVENT_NAMES.ORGANIZE_LEARNERS_BACK_EVENT_NAME,
    );
  });
});

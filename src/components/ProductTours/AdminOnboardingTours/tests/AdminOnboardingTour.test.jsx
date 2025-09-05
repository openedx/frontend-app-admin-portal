import { useEffect } from 'react';
import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import AdminOnboardingTour from '../flows/AdminOnboardingTour';
import { ADMIN_TOUR_EVENT_NAMES } from '../constants';
import useHydrateAdminOnboardingData from '../data/useHydrateAdminOnboardingData';
import { queryClient } from '../../../test/testUtils';
import { SubsidyRequestsContext } from '../../../subsidy-requests';
import { orderBudgets, useBudgetDetailActivityOverview, useSubsidyAccessPolicy } from '../../../learner-credit-management/data';
import { useEnterpriseBudgets } from '../../../EnterpriseSubsidiesContext/data/hooks';

const mockAdminUuid = 'test-admin-uuid';

const mockMessages = {
  collapsibleTitle: {
    id: 'admin.portal.productTours.collapsible.title',
    defaultMessage: 'Quick Start Guide',
  },
  learnerProgressTitle: {
    id: 'admin.portal.productTours.learnerProgress.title',
    defaultMessage: 'Track learner progress',
  },
  learnerProgressBody: {
    id: 'admin.portal.productTours.learnerProgress.body',
    defaultMessage: 'Track learner activity and progress.',
  },
};

const requestsDisabled = {
  subsidyRequestConfiguration: {
    subsidyRequestsEnabled: false,
    subsidyType: 'license',
  },
};

jest.mock('../../../../config', () => ({
  ...jest.requireActual('../../../../config'),
  configuration: {
    ADMIN_ONBOARDING_UUIDS: {
      FLOW_TRACK_LEARNER_PROGRESS_UUID: 'test-flow-uuid',
    },
  },
}));

jest.mock('../data/useHydrateAdminOnboardingData');

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('../../../learner-credit-management/data', () => ({
  orderBudgets: jest.fn(),
  useBudgetDetailActivityOverview: jest.fn(),
  useSubsidyAccessPolicy: jest.fn(),
}));

jest.mock('../../../EnterpriseSubsidiesContext/data/hooks', () => ({
  useEnterpriseBudgets: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }) => defaultMessage,
  }),
  FormattedMessage: ({ defaultMessage, id }) => {
    const message = mockMessages[id] || { defaultMessage };
    return message.defaultMessage;
  },
  defineMessages: (messages) => messages,
}));

const wrapper = ({ children }) => (
  <SubsidyRequestsContext.Provider value={requestsDisabled}>
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  </SubsidyRequestsContext.Provider>
);

const mockOnClose = jest.fn();

const TestComponent = ({ props, onResult }) => {
  const result = AdminOnboardingTour(props);

  // Call the callback with the result so we can access it in tests
  useEffect(() => {
    onResult(result);
  }, [result, onResult]);

  return <div data-testid="result">Tour loaded</div>;
};

describe('AdminOnboardingTour', () => {
  const defaultProps = {
    adminUuid: mockAdminUuid,
    aiButtonVisible: false,
    currentStep: 0,
    enterpriseId: 'test-enterprise-id',
    enterpriseSlug: 'test-enterprise',
    onClose: mockOnClose,
    setCurrentStep: jest.fn(),
    targetSelector: undefined,
    enablePortalLearnerCreditManagementScreen: true,
    enterpriseUUID: 'test-enterprise-uuid',
    enterpriseFeatures: {
      topDownAssignmentRealTimeLcm: true,
    },
  };

  let tourResult = null;

  beforeEach(() => {
    useHydrateAdminOnboardingData.mockReturnValue({ data: { hasEnterpriseMembers: true, hasEnterpriseGroups: true } });
    tourResult = null;
    useBudgetDetailActivityOverview.mockReturnValue({
      isLoading: false,
      isFetching: false,
      data: {
        spentTransactions: { count: 0 },
        contentAssignments: { count: 0 },
      },
    });
    useEnterpriseBudgets.mockReturnValue(
      {
        data: { budgets: [{ id: 'test-id' }] },
      },
    );
    orderBudgets.mockReturnValue([
      {
        id: 'test-id',
      },
    ]);
    useSubsidyAccessPolicy.mockReturnValue({
      data: {
        policyType: 'AssignedLearnerCreditAccessPolicy',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns tour configuration with correct structure', () => {
    render(
      <TestComponent
        props={defaultProps}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    expect(tourResult.length).toBeGreaterThan(0);
  });

  it('includes title and body with FormattedMessage components', () => {
    render(
      <TestComponent
        props={defaultProps}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    expect(tourResult[0].title).toBeDefined();
    expect(tourResult[0].body).toBeDefined();
  });

  it('includes onAdvance function', () => {
    render(
      <TestComponent
        props={defaultProps}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    expect(typeof tourResult[0].onAdvance).toBe('function');
  });

  it('handles missing enterpriseSlug gracefully', () => {
    const propsWithMissingSlug = {
      ...defaultProps,
      enterpriseSlug: undefined,
    };
    render(
      <TestComponent
        props={propsWithMissingSlug}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    expect(tourResult[0]).toBeDefined();
  });

  it('returns all required properties', () => {
    render(
      <TestComponent
        props={defaultProps}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    const requiredProps = [
      'target',
      'title',
      'body',
      'placement',
      'onAdvance',
    ];

    requiredProps.forEach(prop => {
      expect(tourResult[0]).toHaveProperty(prop);
    });
  });

  it('should call sendEnterpriseTrackEvent with correct parameters when tour advances', () => {
    render(
      <TestComponent
        props={defaultProps}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    const firstStep = tourResult[0];

    act(() => {
      firstStep.onAdvance();
    });

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      defaultProps.enterpriseSlug,
      ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_ADVANCE_EVENT_NAME,
      { 'completed-step': 1 },
    );
  });

  it('should call sendEnterpriseTrackEvent with correct parameters when tour goes back', () => {
    const props = {
      ...defaultProps,
      currentStep: 2,
    };

    render(
      <TestComponent
        props={props}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    const secondStep = tourResult[1];

    act(() => {
      secondStep.onBack();
    });

    expect(sendEnterpriseTrackEvent).toHaveBeenLastCalledWith(
      defaultProps.enterpriseSlug,
      ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_BACK_EVENT_NAME,
      { 'back-step': 1 },
    );
  });
  it('should call sendEnterpriseTrackEvent with correct parameters when tour ends', () => {
    render(
      <TestComponent
        props={defaultProps}
        onResult={(result) => { tourResult = result; }}
      />,
      { wrapper },
    );
    const lastStep = tourResult[tourResult.length - 1];

    act(() => {
      lastStep.onEnd();
    });

    expect(mockOnClose).toHaveBeenCalled();
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'test-enterprise',
      ADMIN_TOUR_EVENT_NAMES.LEARNER_PROGRESS_COMPLETED_EVENT_NAME,
    );
  });
});

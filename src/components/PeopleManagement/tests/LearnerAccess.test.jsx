import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter } from 'react-router-dom';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import EVENT_NAMES from '../../../eventTracking';
import LearnerAccess from '../LearnerDetailPage/LearnerAccess';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    enterpriseSlug: 'test-enterprise-slug',
  }),
}));

const subscriptions = [
  {
    uuid: 'sub-1',
    subscriptionPlan: {
      planType: 'Subscription',
      title: 'Test Subscription Plan',
      uuid: 'plan-1',
    },
  },
];

const mockCreditPlansData = [
  {
    uuid: 'credit-1',
    displayName: 'Test Credit Plan',
    active: true,
    policyType: 'AssignedLearnerCreditAccessPolicy',
    planType: 'Credit',
  },
];

const defaultProps = {
  isLoading: false,
  subscriptions,
  creditPlansData: mockCreditPlansData,
};

const renderComponent = (props = {}) => {
  const mergedProps = { ...defaultProps, ...props };
  return render(
    <IntlProvider locale="en">
      <MemoryRouter>
        <LearnerAccess {...mergedProps} />
      </MemoryRouter>
    </IntlProvider>,
  );
};

describe('LearnerAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the access header', () => {
    renderComponent();
    expect(screen.getByText('Learning Access')).toBeInTheDocument();
  });

  it('renders zero state', () => {
    renderComponent({
      subscriptions: [],
      creditPlansData: { results: [] },
    });
    expect(screen.queryByText(
      'This learner has not been invited to any subsidies.',
    )).toBeInTheDocument();
  });

  it('renders subscription section when subscriptions exist', () => {
    renderComponent();
    expect(screen.getByText('SUBSCRIPTION')).toBeInTheDocument();
    expect(screen.getByText('Test Subscription Plan')).toBeInTheDocument();
  });

  it('does not render subscription section when no subscriptions exist', () => {
    renderComponent({
      subscriptions: [],
    });
    expect(screen.queryByText('SUBSCRIPTION')).not.toBeInTheDocument();
  });

  it('renders credit plans section when credit plans exist', () => {
    renderComponent();
    expect(screen.getByText('LEARNER CREDIT')).toBeInTheDocument();
    expect(screen.getByText('Test Credit Plan')).toBeInTheDocument();
  });

  it('does not render credit plans section when no credit plans exist', () => {
    renderComponent({
      creditPlansData: { results: [] },
    });
    expect(screen.queryByText('LEARNER CREDIT')).not.toBeInTheDocument();
  });

  it('displays correct policy type for credit plans', () => {
    renderComponent();
    expect(screen.getByText('Assignment')).toBeInTheDocument();

    renderComponent({
      creditPlansData: [{
        ...mockCreditPlansData[0],
        policyType: 'LearnerCreditAccessPolicy',
      }],
    });
    expect(screen.getByText('Browse & Enroll')).toBeInTheDocument();
  });

  it('renders subscription plan type', () => {
    renderComponent();
    expect(screen.getByText('Subscription')).toBeInTheDocument();
  });

  it('sends track event when clicking subscription link', () => {
    renderComponent();
    const subscriptionLink = screen.getByText('Test Subscription Plan');
    subscriptionLink.click();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'test-enterprise-slug',
      EVENT_NAMES.LEARNER_PROFILE_VIEW.VIEW_SUBSCRIPTION_LINK_CLICK,
      {
        subscriptionUuid: 'plan-1',
        subscriptionTitle: 'Test Subscription Plan',
        planType: 'Subscription',
      },
    );
  });

  it('sends track event when clicking credit plan link', () => {
    renderComponent();
    const creditPlanLink = screen.getByText('Test Credit Plan');
    creditPlanLink.click();

    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      'test-enterprise-slug',
      EVENT_NAMES.LEARNER_PROFILE_VIEW.VIEW_CREDIT_PLAN_LINK,
      {
        creditPlanUuid: 'credit-1',
        creditPlanName: 'Test Credit Plan',
        policyType: 'AssignedLearnerCreditAccessPolicy',
      },
    );
  });
});

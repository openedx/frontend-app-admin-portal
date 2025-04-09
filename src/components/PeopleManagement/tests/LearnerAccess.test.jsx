import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter } from 'react-router-dom';
import LearnerAccess from '../LearnerDetailPage/LearnerAccess';

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
  it('renders the access header', () => {
    renderComponent();
    expect(screen.getByText('Learning Access')).toBeInTheDocument();
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
});

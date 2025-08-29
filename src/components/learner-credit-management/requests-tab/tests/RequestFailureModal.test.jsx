import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import RequestFailureModal from '../RequestFailureModal';
import { REQUEST_RECENT_ACTIONS } from '../../data';

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: () => ({ ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL: 'https://support.example.com/learner-credit' }),
}));

const renderWithIntl = (ui) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

describe('RequestFailureModal', () => {
  const baseProps = {
    errorReason: 'Failed: Approval',
    isOpen: true,
    onClose: jest.fn(),
    target: { current: document.createElement('div') },
  };

  it('returns null when isOpen prop is false', () => {
    const { container } = renderWithIntl(<RequestFailureModal {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders errorReason text inside modal heading', () => {
    renderWithIntl(<RequestFailureModal {...baseProps} />);
    expect(screen.getByRole('heading', { level: 3, name: baseProps.errorReason })).toBeInTheDocument();
  });

  it('renders decline failure contextual message when recentAction=declined', () => {
    renderWithIntl(<RequestFailureModal {...baseProps} recentAction={REQUEST_RECENT_ACTIONS.declined} />);
    expect(screen.getByText(/attempt to decline this enrollment request has failed/i)).toBeInTheDocument();
    expect(screen.queryByText(/was not approved/i)).not.toBeInTheDocument();
  });

  it('renders approval failure contextual message when recentAction=approved', () => {
    renderWithIntl(<RequestFailureModal {...baseProps} recentAction={REQUEST_RECENT_ACTIONS.approved} />);
    expect(screen.getByText(/This enrollment request was not approved/i)).toBeInTheDocument();
    expect(screen.queryByText(/attempt to decline this enrollment request has failed/i)).not.toBeInTheDocument();
  });

  it('does not render contextual decline/approval messages for other recentAction values', () => {
    renderWithIntl(<RequestFailureModal {...baseProps} recentAction={REQUEST_RECENT_ACTIONS.requested} />);
    expect(screen.queryByText(/attempt to decline this enrollment request has failed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/This enrollment request was not approved/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Something went wrong behind the scenes/i)).toBeInTheDocument();
  });

  it('displays resolution steps list and Help Center hyperlink', () => {
    renderWithIntl(<RequestFailureModal {...baseProps} />);
    expect(screen.getByText(/Wait and try to (decline|approve)/i)).toBeInTheDocument();
    expect(screen.getByText(/If the issue continues, contact customer support/i)).toBeInTheDocument();
    const helpLink = screen.getByRole('link', { name: /Help Center: Learner Selected Content/i });
    expect(helpLink).toHaveAttribute('href', 'https://support.example.com/learner-credit');
  });
});

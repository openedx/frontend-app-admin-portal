import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AdminRolesSurveyBanner from '.';
import { ADMIN_ROLES_SURVEY_DISMISSED_COOKIE_NAME } from '../EnterpriseApp/data/constants';

const renderWithIntl = (ui) => render(<IntlProvider locale="en">{ui}</IntlProvider>);

describe('<AdminRolesSurveyBanner />', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  it('renders the banner when the dismissed cookie is not set', () => {
    renderWithIntl(<AdminRolesSurveyBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Help shape our new feature/)).toBeInTheDocument();
  });

  it('does not render the banner when the dismissed cookie is already set', () => {
    global.localStorage.setItem(ADMIN_ROLES_SURVEY_DISMISSED_COOKIE_NAME, 'true');
    renderWithIntl(<AdminRolesSurveyBanner />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hides the banner and sets localStorage when dismissed', async () => {
    renderWithIntl(<AdminRolesSurveyBanner />);
    expect(screen.getByRole('alert')).toBeInTheDocument();

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    const user = userEvent.setup();
    await user.click(dismissButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(global.localStorage.getItem(ADMIN_ROLES_SURVEY_DISMISSED_COOKIE_NAME)).toBe('true');
  });
});

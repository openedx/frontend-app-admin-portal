import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SettingsSSOTab from '..';
import { HELP_CENTER_SAML_LINK } from '../../data/constants';

const enterpriseId = 'an-id';
describe('SAML Config Tab', () => {
  test('renders base page with correct text and help center link', () => {
    render(<SettingsSSOTab enterpriseId={enterpriseId} />);
    expect(screen.queryByText('SAML Configuration')).toBeInTheDocument();
    expect(screen.queryByText('Help Center')).toBeInTheDocument();
    const link = screen.getByText('Help Center');
    expect(link.getAttribute('href')).toBe(HELP_CENTER_SAML_LINK);
  });
});

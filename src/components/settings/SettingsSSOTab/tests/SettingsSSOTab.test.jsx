import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import SettingsSSOTab from '..';
import { HELP_CENTER_SAML_LINK } from '../../data/constants';

import LmsApiService from '../../../../data/services/LmsApiService';

const enterpriseId = 'an-id-1';
jest.mock('../../../../data/services/LmsApiService');

describe('SAML Config Tab', () => {
  test('renders base page with correct text and help center link', async () => {
    const aResult = () => Promise.resolve(1);
    LmsApiService.getProviderConfig.mockImplementation(() => []);
    render(<SettingsSSOTab enterpriseId={enterpriseId} />);
    expect(screen.queryByText('SAML Configuration')).toBeInTheDocument();
    expect(screen.queryByText('Help Center')).toBeInTheDocument();
    const link = screen.getByText('Help Center');
    expect(link.getAttribute('href')).toBe(HELP_CENTER_SAML_LINK);
    await act(() => aResult());
  });
});

import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import LmsApiService from '../../../../data/services/LmsApiService';
import SettingsApiCredentialsTab from '../index';
import {
  API_CLIENT_DOCUMENTATION, HELP_CENTER_API_GUIDE, API_TERMS_OF_SERVICE, ENTERPRISE_CUSTOMER_SUPPORT_EMAIL,
} from '../../data/constants';

jest.mock('../../../../data/services/LmsApiService', () => ({
  fetchAPICredentials: jest.fn(),
  createNewAPICredentials: jest.fn(),
  regenerateAPICredentials: jest.fn(),
}));

const name = "edx's Enterprise Credentials";
const clientId = 'y0TCvOEvvIs6ll95irirzCJ5EaF0RnSbBIIXuNJE';
const clientSecret = '1G896sVeT67jtjHO6FNd5qFqayZPIV7BtnW01P8zaAd4mDfmBVVVsUP33u';
const updated = '2023-07-28T04:28:20.909550Z';
const redirectUris = 'www.customercourses.edx.com, www.customercourses.edx.stage.com';

const data = {
  name,
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uris: redirectUris,
  updated,
};
const regenerationData = {
  ...data,
  redirect_uris: redirectUris,
};
const copiedData = {
  ...data,
  api_client_documentation: API_CLIENT_DOCUMENTATION,
};

describe('API Credentials Tab', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const basicProps = {
    enterpriseId: 'test-enterprise-uuid',
  };

  const enterpriseId = 'test-enterprise-uuid';

  test('renders zero state page when having no api credentials', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    const mockCreateFn = jest.spyOn(LmsApiService, 'createNewAPICredentials');
    mockFetchFn.mockRejectedValue();
    mockCreateFn.mockResolvedValue();

    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );
    expect(screen.getByText('API credentials')).toBeInTheDocument();
    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());
    expect(screen.getByText("You don't have API credentials yet.")).toBeInTheDocument();
    expect(screen.queryByText('Help Center: EdX Enterprise API Guide')).toBeInTheDocument();
    const helpLink = screen.getByText('Help Center: EdX Enterprise API Guide');
    expect(helpLink.getAttribute('href')).toBe(HELP_CENTER_API_GUIDE);
    const serviceLink = screen.getByText('edX API terms of service');
    expect(serviceLink.getAttribute('href')).toBe(API_TERMS_OF_SERVICE);

    expect(screen.getByText('Generate API Credentials').toBeInTheDocument);
    userEvent.click(screen.getByText('Generate API Credentials'));
    await waitFor(() => expect(mockCreateFn).toHaveBeenCalled());
  });
  test('renders api credentials page when having existing api credentials', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    mockFetchFn.mockResolvedValue({ data });
    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(name)).toBeInTheDocument);

    expect(screen.getByText(name).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `Allowed URIs: ${redirectUris}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client ID: ${clientId}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client secret: ${clientSecret}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client documentation: ${API_CLIENT_DOCUMENTATION}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `Last generated on: ${updated}` }).toBeInTheDocument);
    const link = screen.getByText('contact Enterprise Customer Support.');
    expect(link.getAttribute('href')).toBe(`mailto:${ENTERPRISE_CUSTOMER_SUPPORT_EMAIL}`);
  });
  test('renders error stage while creating new api credentials through clicking generation button', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    mockFetchFn.mockRejectedValue();
    const mockCreatFn = jest.spyOn(LmsApiService, 'createNewAPICredentials');
    mockCreatFn.mockRejectedValue();

    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());
    userEvent.click(screen.getByText('Generate API Credentials'));
    await waitFor(() => { expect(mockCreatFn).toHaveBeenCalled(); });
    expect(
      screen.getByText(
        'Something went wrong while generating your credentials. Please try again. If the issue continues, contact Enterprise Customer Support.',
      ),
    ).toBeInTheDocument();
  });
  test('renders api credentials page after successfully creating api credentials through clicking generation button', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    mockFetchFn.mockRejectedValue();
    const mockCreatFn = jest.spyOn(LmsApiService, 'createNewAPICredentials');
    mockCreatFn.mockResolvedValue({ data });
    const writeText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
    const jsonString = JSON.stringify(copiedData);
    navigator.clipboard.writeText.mockResolvedValue(jsonString);

    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());

    userEvent.click(screen.getByText('Generate API Credentials'));
    await waitFor(() => expect(mockCreatFn).toHaveBeenCalled());
    expect(screen.getByText('API credentials successfully generated')).toBeInTheDocument();
    const closeButton = screen.getByLabelText('Close');
    userEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByText('API credentials successfully generated')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: `Application name: ${name}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `Allowed URIs: ${redirectUris}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client ID: ${clientId}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client secret: ${clientSecret}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client documentation: ${API_CLIENT_DOCUMENTATION}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `Last generated on: ${updated}` }).toBeInTheDocument);

    const copyBtn = screen.getByText('Copy credentials to clipboard');
    userEvent.click(copyBtn);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(jsonString));
    await waitFor(() => expect(screen.getByText('Copied Successfully')).toBeInTheDocument());
  });
  test('renders error message when failing to copying api credentials to clipboard', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    mockFetchFn.mockRejectedValue();
    const mockCreatFn = jest.spyOn(LmsApiService, 'createNewAPICredentials');
    mockCreatFn.mockResolvedValue({ data });
    const writeText = jest.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
    const jsonString = JSON.stringify(copiedData);
    navigator.clipboard.writeText.mockRejectedValue();

    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());

    userEvent.click(screen.getByText('Generate API Credentials'));
    await waitFor(() => expect(mockCreatFn).toHaveBeenCalled());
    const copyBtn = screen.getByText('Copy credentials to clipboard');
    userEvent.click(copyBtn);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith(jsonString));
    await waitFor(() => expect(screen.getByText('Cannot copied to the clipboard')).toBeInTheDocument());
  });
  test('renders api credentials page after successfully regenerating api credentials', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    mockFetchFn.mockResolvedValue({ data });
    const mockPatchFn = jest.spyOn(LmsApiService, 'regenerateAPICredentials');
    mockPatchFn.mockResolvedValue({ data: regenerationData });

    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );
    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());
    const input = screen.getByTestId('form-control');
    expect(input).toHaveValue('');
    userEvent.type(input, redirectUris);
    await waitFor(() => expect(input).toHaveValue(redirectUris));
    const button = screen.getByText('Regenerate API Credentials');
    userEvent.click(button);

    await waitFor(() => expect(screen.getByText('Regenerate API credentials?')).toBeInTheDocument());
    const confirmedButton = screen.getByText('Regenerate');
    userEvent.click(confirmedButton);
    await waitFor(() => {
      expect(mockPatchFn).toHaveBeenCalledWith(redirectUris, enterpriseId);
    });
    expect(screen.getByRole('heading', { name: `Application name: ${name}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `Allowed URIs: ${redirectUris}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client ID: ${clientId}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client secret: ${clientSecret}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `API client documentation: ${API_CLIENT_DOCUMENTATION}` }).toBeInTheDocument);
    expect(screen.getByRole('heading', { name: `Last generated on: ${updated}` }).toBeInTheDocument);
    expect(screen.queryByText('Something went wrong while generating your credentials. Please try again. If the issue continues, contact Enterprise Customer Support.'))
      .not.toBeInTheDocument();
  });
  test('renders error state when failing to regenerating api credentials', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    mockFetchFn.mockResolvedValue({ data });
    const mockPatchFn = jest.spyOn(LmsApiService, 'regenerateAPICredentials');
    mockPatchFn.mockRejectedValue();

    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );
    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());
    const input = screen.getByTestId('form-control');
    expect(input).toHaveValue('');
    userEvent.type(input, redirectUris);
    await waitFor(() => expect(input).toHaveValue(redirectUris));
    const button = screen.getByText('Regenerate API Credentials');
    userEvent.click(button);

    await waitFor(() => expect(screen.getByText('Regenerate API credentials?')).toBeInTheDocument());
    const confirmedButton = screen.getByText('Regenerate');
    userEvent.click(confirmedButton);
    await waitFor(() => {
      expect(mockPatchFn).toHaveBeenCalledWith(redirectUris, enterpriseId);
    });
    expect(screen.getByRole('heading', { name: `Allowed URIs: ${redirectUris}` }).toBeInTheDocument);
    expect(screen.getByText('Something went wrong while generating your credentials. Please try again. If the issue continues, contact Enterprise Customer Support.'))
      .toBeInTheDocument();
  });
  test('renders api credentials when canceling regenerating api credentials', async () => {
    const mockFetchFn = jest.spyOn(LmsApiService, 'fetchAPICredentials');
    mockFetchFn.mockResolvedValue({ data });
    const mockPatchFn = jest.spyOn(LmsApiService, 'regenerateAPICredentials');
    mockPatchFn.mockResolvedValue({ data: regenerationData });

    render(
      <IntlProvider locale="en">
        <SettingsApiCredentialsTab {...basicProps} />
      </IntlProvider>,
    );

    await waitFor(() => expect(mockFetchFn).toHaveBeenCalled());
    const input = screen.getByTestId('form-control');
    expect(input).toHaveValue('');
    userEvent.type(input, redirectUris);
    await waitFor(() => expect(input).toHaveValue(redirectUris));
    const button = screen.getByText('Regenerate API Credentials');
    userEvent.click(button);

    await waitFor(() => expect(screen.getByText('Regenerate API credentials?')).toBeInTheDocument());
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    await waitFor(() => {
      expect(mockPatchFn).not.toHaveBeenCalledWith(redirectUris, enterpriseId);
    });
    expect(screen.getByRole('heading', { name: `Allowed URIs: ${redirectUris}` }).toBeInTheDocument);
  });
});

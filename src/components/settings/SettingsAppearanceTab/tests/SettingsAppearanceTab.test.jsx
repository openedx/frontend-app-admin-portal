import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SettingsAppearanceTab } from '..';
import { SAGE_THEME, SCHOLAR_THEME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';

const enterpriseId = 'an-id-1';

let entepriseBranding = {
  primary_color: SCHOLAR_THEME.button,
  secondary_color: SCHOLAR_THEME.banner,
  tertiary_color: SCHOLAR_THEME.accent,
};

const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enterpriseName: 'sluggyent',
    enterpriseBranding: {
      primary_color: SCHOLAR_THEME.banner,
      secondary_color: SCHOLAR_THEME.button,
      tertiary_color: SCHOLAR_THEME.accent,
    },
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = aStore => mockStore(aStore);
const store = getMockStore({ ...initialStore });

jest.mock('../../../../data/services/LmsApiService', () => ({
  updateEnterpriseCustomerBranding: jest.fn(),
}));

describe('Portal Appearance Tab', () => {
  test('renders base page with correct text and dropzone', async () => {
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <SettingsAppearanceTab enterpriseId={enterpriseId} enterpriseBranding={entepriseBranding} />
        </Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Portal Appearance')).toBeInTheDocument();
    expect(screen.getByText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your file here or click to upload.')).toBeInTheDocument();
  });

  test('info hover on logo', async () => {
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <SettingsAppearanceTab enterpriseId={enterpriseId} enterpriseBranding={entepriseBranding} />
        </Provider>
      </IntlProvider>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.mouseOver(screen.getByTestId('logo-info-hover'));
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });
  test('drop image into dropzone', async () => {
    const spy = jest.spyOn(LmsApiService, 'updateEnterpriseCustomerBranding');
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <SettingsAppearanceTab enterpriseId={enterpriseId} enterpriseBranding={entepriseBranding} />
        </Provider>
      </IntlProvider>,
    );

    const fakeFile = new File(['hello'], 'hello.png', { type: 'image/png' });
    const testFormData = new FormData();
    testFormData.append('logo', fakeFile);
    const dropzone = screen.getByText('Drag and drop your file here or click to upload.');
    Object.defineProperty(dropzone, 'files', {
      value: [fakeFile],
    });
    fireEvent.drop(dropzone);
    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });
  test('renders curated theme cards', async () => {
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <SettingsAppearanceTab enterpriseId={enterpriseId} enterpriseBranding={entepriseBranding} />
        </Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Scholar (Default)')).toBeInTheDocument();
    expect(screen.getByTestId('radio-Scholar (Default)')).toBeChecked();
    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByText('Impact')).toBeInTheDocument();
    expect(screen.getByText('Cambridge')).toBeInTheDocument();
    expect(screen.getByText('Acumen')).toBeInTheDocument();
    expect(screen.getByText('Pioneer')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('radio-Impact'));
    await waitFor(() => {
      expect(screen.getByTestId('radio-Impact')).toBeChecked();
    });
  });
  test('autoselects correct brand card', async () => {
    entepriseBranding = {
      primary_color: SAGE_THEME.button,
      secondary_color: SAGE_THEME.banner,
      tertiary_color: SAGE_THEME.accent,
    };

    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <SettingsAppearanceTab enterpriseId={enterpriseId} enterpriseBranding={entepriseBranding} />
        </Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Sage')).toBeInTheDocument();
    expect(screen.getByTestId('radio-Sage')).toBeChecked();
  });
});

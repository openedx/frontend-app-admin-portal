import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import SettingsAppearanceTab from '..';

const enterpriseId = 'an-id-1';

const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enterpriseName: 'sluggyent',
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = aStore => mockStore(aStore);
const store = getMockStore({ ...initialStore });

describe('Portal Appearance Tab', () => {
  test('renders base page with correct text and dropzone', async () => {
    render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <SettingsAppearanceTab enterpriseId={enterpriseId} />
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
          <SettingsAppearanceTab enterpriseId={enterpriseId} />
        </Provider>
      </IntlProvider>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
    fireEvent.mouseOver(screen.getByTestId('logo-info-hover'));
    await waitFor(() => screen.getByRole('tooltip'));
    expect(screen.getByRole('tooltip').toBeInTheDocument);
  });
});

import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import snakeCase from 'lodash/snakeCase';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import DegreedIntegrationConfigForm from './DegreedIntegrationConfigForm';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('../../data/services/LmsApiService', () => ({
  postNewDegreedConfig: jest.fn(),
  updateDegreedConfig: jest.fn(),
}));

const enterpriseId = 'test-enterprise';
const mockStore = configureMockStore([thunk]);
const store = mockStore({});

const DegreedIntegrationConfigFormWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <IntlProvider locale="en">
        <DegreedIntegrationConfigForm {...props} />
      </IntlProvider>
    </Provider>
  </MemoryRouter>
);

describe('<DegreedIntegrationConfigForm />', () => {
  test('renders Degreed Config Form', () => {
    render(<DegreedIntegrationConfigFormWrapper enterpriseId={enterpriseId} />);
    // Verify all expected fields are present.
    screen.getByLabelText('Active');
    screen.getByLabelText('Degreed User ID');
    screen.getByLabelText('Degreed User Password');
    screen.getByLabelText('Degreed Instance URL');
    screen.getByLabelText('Degreed Organization Code');
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
  });

  test('fills in fields when config is passed in as argument/prop.', () => {
    const initialConfig = {
      active: true,
      degreedUserId: 'initial_id',
      degreedUserPassword: 'initial_pass',
      degreedBaseUrl: 'initial_url',
      degreedCompanyId: 'initial_org',
      key: 'initial_key',
      secret: 'initial_secret',
    };
    render(<DegreedIntegrationConfigFormWrapper enterpriseId={enterpriseId} config={initialConfig} />);
    expect(screen.getByLabelText('Active')).toBeChecked();
    expect(screen.getByLabelText('Degreed User ID')).toHaveValue('initial_id');
    expect(screen.getByLabelText('Degreed User Password')).toHaveValue('initial_pass');
    expect(screen.getByLabelText('Degreed Instance URL')).toHaveValue('initial_url');
    expect(screen.getByLabelText('Degreed Organization Code')).toHaveValue('initial_org');
    expect(screen.getByLabelText('API Client ID')).toHaveValue('initial_key');
    expect(screen.getByLabelText('API Client Secret')).toHaveValue('initial_secret');
  });

  test('required fields show as invalid when not filled in', () => {
    render(<DegreedIntegrationConfigFormWrapper enterpriseId={enterpriseId} />);
    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByLabelText('Degreed User ID')).toHaveClass('is-invalid');
    expect(screen.getByLabelText('Degreed User Password')).toHaveClass('is-invalid');
    expect(screen.getByLabelText('Degreed Instance URL')).toHaveClass('is-invalid');
    expect(screen.getByLabelText('Degreed Organization Code')).toHaveClass('is-invalid');
    expect(screen.getByLabelText('API Client ID')).toHaveClass('is-invalid');
    expect(screen.getByLabelText('API Client Secret')).toHaveClass('is-invalid');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Form could not be submitted as there are fields with invalid values. '
      + 'Please correct them below.',
    );
  });

  test('submit calls postNewDegreedConfig when config is not present', () => {
    const expectedFormData = {
      degreed_user_id: 'testuserid',
      degreed_user_password: 'testpass',
      degreed_base_url: 'testinstance',
      degreed_company_id: 'testorg',
      key: 'testclientid',
      secret: 'testsecret',
      enterprise_customer: enterpriseId,
    };

    render(<DegreedIntegrationConfigFormWrapper enterpriseId={enterpriseId} />);
    fireEvent.change(screen.getByLabelText('Degreed User ID'), {
      target: { value: 'testuserid' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User Password'), {
      target: { value: 'testpass' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Instance URL'), {
      target: { value: 'testinstance' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Organization Code'), {
      target: { value: 'testorg' },
    });
    fireEvent.change(screen.getByLabelText('API Client ID'), {
      target: { value: 'testclientid' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret'), {
      target: { value: 'testsecret' },
    });
    fireEvent.click(screen.getByText('Submit'));

    const postedFormData = Array.from(LmsApiService.postNewDegreedConfig.mock.calls[0][0].entries())
      .reduce((acc, f) => ({ ...acc, [f[0]]: f[1] }), {});

    expect(postedFormData).toMatchObject(expectedFormData);
  });

  test('submit calls updateDegreedConfig when config is not present', () => {
    const initialConfig = {
      degreedUserId: 'testuserid',
      degreedUserPassword: 'testpass',
      degreedBaseUrl: 'testinstance',
      degreedCompanyId: 'testorg',
      key: 'testclientid',
      secret: 'testsecret',
    };

    render(<DegreedIntegrationConfigFormWrapper enterpriseId={enterpriseId} config={initialConfig} />);
    fireEvent.change(screen.getByLabelText('Degreed User ID'), {
      target: { value: 'changedUserId' },
    });
    fireEvent.click(screen.getByText('Submit'));

    const updatedConfig = {};
    Object.entries(initialConfig)
      .forEach(([key, value]) => {
        updatedConfig[snakeCase(key)] = value;
      });
    updatedConfig.degreed_user_id = 'changedUserId';
    updatedConfig.enterprise_customer = enterpriseId;

    const postedFormData = Array.from(LmsApiService.updateDegreedConfig.mock.calls[0][0].entries())
      .reduce((acc, f) => ({ ...acc, [f[0]]: f[1] }), {});

    expect(postedFormData).toMatchObject(updatedConfig);
  });
});

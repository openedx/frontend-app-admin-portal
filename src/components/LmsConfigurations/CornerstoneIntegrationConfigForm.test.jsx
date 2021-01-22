import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import snakeCase from 'lodash/snakeCase';
import CornerstoneIntegrationConfigForm from './CornerstoneIntegrationConfigForm';
import LmsApiService from '../../data/services/LmsApiService';

jest.mock('../../data/services/LmsApiService', () => ({
  postNewCornerstoneConfig: jest.fn(),
  updateCornerstoneConfig: jest.fn(),
}));

const enterpriseId = 'test-enterprise';

describe('<CornerstoneIntegrationConfigForm />', () => {
  test('renders Cornerstone Config Form', () => {
    render(<CornerstoneIntegrationConfigForm enterpriseId={enterpriseId} />);
    // Verify all expected fields are present.
    screen.getByLabelText('Active');
    screen.getByLabelText('Cornerstone Instance URL');
  });

  test('fills in fields when config is passed in as argument/prop.', () => {
    const initialConfig = {
      active: true,
      cornerstoneBaseUrl: 'initial_url',
    };
    render(<CornerstoneIntegrationConfigForm enterpriseId={enterpriseId} config={initialConfig} />);
    expect(screen.getByLabelText('Active')).toBeChecked();
    expect(screen.getByLabelText('Cornerstone Instance URL')).toHaveValue('initial_url');
  });

  test('required fields show as invalid when not filled in', () => {
    render(<CornerstoneIntegrationConfigForm enterpriseId={enterpriseId} />);
    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByLabelText('Cornerstone Instance URL')).toHaveClass('is-invalid');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Form could not be submitted as there are fields with invalid values. '
      + 'Please correct them below.',
    );
  });

  test('submit calls postNewCornerstoneConfig when config is not present', () => {
    const expectedFormData = {
      cornerstone_base_url: 'testinstance',
      enterprise_customer: enterpriseId,
    };

    render(<CornerstoneIntegrationConfigForm enterpriseId={enterpriseId} />);
    fireEvent.change(screen.getByLabelText('Cornerstone Instance URL'), {
      target: { value: 'testinstance' },
    });
    fireEvent.click(screen.getByText('Submit'));

    const postedFormData = Array.from(LmsApiService.postNewCornerstoneConfig.mock.calls[0][0].entries())
      .reduce((acc, f) => ({ ...acc, [f[0]]: f[1] }), {});

    expect(postedFormData).toMatchObject(expectedFormData);
  });

  test('submit calls updateCornerstoneConfig when config is not present', () => {
    const initialConfig = {
      cornerstoneBaseUrl: 'testinstance',
    };

    render(<CornerstoneIntegrationConfigForm enterpriseId={enterpriseId} config={initialConfig} />);
    fireEvent.change(screen.getByLabelText('Cornerstone Instance URL'), {
      target: { value: 'changedURL' },
    });
    fireEvent.click(screen.getByText('Submit'));

    const updatedConfig = {};
    Object.entries(initialConfig)
      .forEach(([key, value]) => {
        updatedConfig[snakeCase(key)] = value;
      });
    updatedConfig.cornerstone_base_url = 'changedURL';
    updatedConfig.enterprise_customer = enterpriseId;

    const postedFormData = Array.from(LmsApiService.updateCornerstoneConfig.mock.calls[0][0].entries())
      .reduce((acc, f) => ({ ...acc, [f[0]]: f[1] }), {});

    expect(postedFormData).toMatchObject(updatedConfig);
  });
});

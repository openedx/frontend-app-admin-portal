import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import ExistingLMSCardDeck from '../ExistingLMSCardDeck';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService');

const enterpriseCustomerUuid = 'test-enterprise-id';
const mockEditExistingConfigFn = jest.fn();
const mockOnClick = jest.fn();
const configData = [
  {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: true,
    displayName: 'foobar',
  },
];

const disabledConfigData = [
  {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: false,
    displayName: 'foobar',
  },
];

const incompleteConfigData = [
  {
    channelCode: 'BLACKBOARD',
    id: 2,
    isValid: [{ missing: ['client_id', 'refresh_token'] }, { incorrect: ['blackboard_base_url'] }],
    active: false,
    displayName: 'barfoo',
  },
];

describe('<ExistingLMSCardDeck />', () => {
  it('renders active config card', () => {
    render(
      <ExistingLMSCardDeck
        configData={configData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('foobar')).toBeInTheDocument();
  });
  it('renders incomplete config card', () => {
    render(
      <ExistingLMSCardDeck
        configData={incompleteConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByText('Incomplete')).toBeInTheDocument();
    expect(screen.getByText('barfoo')).toBeInTheDocument();
    act(() => {
      fireEvent.mouseOver(screen.getByText('Incomplete'));
    });
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('2 fields')).toBeInTheDocument();
  });
  it('renders multiple config cards', () => {
    render(
      <ExistingLMSCardDeck
        configData={configData.concat(incompleteConfigData)}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByText('barfoo')).toBeInTheDocument();
    expect(screen.getByText('foobar')).toBeInTheDocument();
  });
  it('renders delete card action', () => {
    render(
      <ExistingLMSCardDeck
        configData={incompleteConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByTestId(`existing-lms-config-card-dropdown-${incompleteConfigData[0].id}`)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`existing-lms-config-card-dropdown-${incompleteConfigData[0].id}`));

    expect(screen.getByTestId('dropdown-delete-item')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dropdown-delete-item'));
    expect(LmsApiService.deleteBlackboardConfig).toHaveBeenCalledWith(incompleteConfigData[0].id);
  });
  it('renders disable card action', () => {
    render(
      <ExistingLMSCardDeck
        configData={configData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByTestId(`existing-lms-config-card-dropdown-${configData[0].id}`)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`existing-lms-config-card-dropdown-${configData[0].id}`));

    expect(screen.getByTestId('dropdown-disable-item')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dropdown-disable-item'));
    const expectedConfigOptions = {
      active: false,
      enterprise_customer: enterpriseCustomerUuid,
    };
    expect(LmsApiService.updateBlackboardConfig).toHaveBeenCalledWith(expectedConfigOptions, configData[0].id);
  });
  it('renders enable card action', () => {
    render(
      <ExistingLMSCardDeck
        configData={disabledConfigData}
        editExistingConfig={mockEditExistingConfigFn}
        onClick={mockOnClick}
        enterpriseCustomerUuid={enterpriseCustomerUuid}
      />,
    );
    expect(screen.getByTestId(`existing-lms-config-card-dropdown-${configData[0].id}`)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`existing-lms-config-card-dropdown-${configData[0].id}`));

    expect(screen.getByTestId('dropdown-enable-item')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('dropdown-enable-item'));
    const expectedConfigOptions = {
      active: true,
      enterprise_customer: enterpriseCustomerUuid,
    };
    expect(LmsApiService.updateBlackboardConfig).toHaveBeenCalledWith(expectedConfigOptions, configData[0].id);
  });
});

import { render, screen } from '@testing-library/react';
import { defineMessage, useIntl } from 'react-intl';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToggle } from '@openedx/paragon';
import React from 'react';
import { NewAssignmentModalButton } from '../NewAssignmentModalButton';
import { useSubsidyAccessPolicy, useEnterpriseFlexGroups, useBudgetId } from '../../data';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';

// mock useIntl()
jest.mock('@edx/frontend-platform/i18n', () => ({
  useIntl: () => ({
    formatMessage: jest.fn(),
  }),
  defineMessages: jest.fn().mockReturnValue({
    subsidyTypeCodes: 'subsidyTypeCodes',
    subsidyTypeLicenses: 'subsidyTypeLicenses',
  }),
}));

// mock useNavigate
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn().mockReturnValue({ budgetId: '1', enterpriseSlug: 'enterpriseSlug', enterpriseAppPage: 'enterpriseAppPage' }),
}));

// mock useQueryClient
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(),
}));

// mock data hooks
jest.mock('../../data', () => ({
  useSubsidyAccessPolicy: jest.fn(),
  useEnterpriseFlexGroups: jest.fn().mockReturnValue({
    data: [],
  }),
  useBudgetId: jest.fn().mockReturnValue({
    subsidyAccessPolicyId: '1',
  }),
}));

// mock getConfig
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL: 'https://support.example.com',
  })),
}));

describe('<NewAssignmentModalButton />', () => {
  it('Assignment Button is rendered', () => {
    render(
      <BudgetDetailPageContext.Provider value={{ displayToastForAssignmentAllocation: {} }}>
        <NewAssignmentModalButton />
      </BudgetDetailPageContext.Provider>,
    );
    expect(screen.getByText('Assign')).toBeInTheDocument();
  });
});

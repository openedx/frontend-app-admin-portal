/* eslint-disable react/prop-types */
import { renderWithRouter } from '@2uinc/frontend-enterprise-utils';
import { screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { axe } from 'jest-axe';
import EnterpriseList from './index';
import mockEnterpriseList from './EnterpriseList.mocks';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

jest.mock('../../data/services/LmsApiService', () => ({
  fetchEnterpriseList: () => Promise.resolve({
    data: mockEnterpriseList,
  }),
}));

const EnterpriseListWrapper = () => (
  <IntlProvider locale="en">
    <EnterpriseList clearPortalConfiguration={() => { }} />
  </IntlProvider>
);

describe('EnterpriseList', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithRouter(<EnterpriseListWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders the EnterpriseList', () => {
    renderWithRouter(<EnterpriseListWrapper />);
    expect(screen.getByText('loading')).toBeTruthy();
  });
  it('renders the datatable with data', async () => {
    renderWithRouter(<EnterpriseListWrapper />);
    expect(screen.getByText('loading')).toBeTruthy();
    await waitFor(() => expect(screen.getByText('Enterprise 1')).toBeTruthy());
  });
});

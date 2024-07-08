/* eslint-disable react/prop-types */
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import EnterpriseList from './index';
import mockEnterpriseList from './EnterpriseList.mocks';

jest.mock('lodash.debounce', () => jest.fn((fn) => fn));

jest.mock('../../data/services/LmsApiService', () => ({
  fetchEnterpriseList: () => Promise.resolve({
    data: mockEnterpriseList,
  }),
}));

const EnterpriseListWrapper = () => (
  <IntlProvider>
    <EnterpriseList clearPortalConfiguration={() => { }} />
  </IntlProvider>
);

describe('EnterpriseList', () => {
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

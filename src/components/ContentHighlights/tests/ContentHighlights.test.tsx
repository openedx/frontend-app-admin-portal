import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import ContentHighlights from '../ContentHighlights';
import {
  EnterpriseAppContext, TEnterpriseAppContext, TEnterpriseCuration, THighlightSet,
} from '../../EnterpriseApp/EnterpriseAppContextProvider';
import LmsApiService from '../../../data/services/LmsApiService';
import { GROUP_TYPE_BUDGET } from '../../PeopleManagement/constants';
import { useAlgoliaSearch } from '../../algolia-search';
import type { UseAlgoliaSearchResult } from '../../algolia-search';

jest.mock('../../../data/services/LmsApiService');

jest.mock('../../algolia-search/useAlgoliaSearch', () => jest.fn());

const mockStore = configureMockStore([thunk]);
const initialEnterpriseAppContextValue: TEnterpriseAppContext = {
  enterpriseCuration: {
    enterpriseCuration: {
      uuid: 'test-curation-uuid',
      title: 'Curation Title',
      isHighlightFeatureActive: true,
      canOnlyViewHighlightSets: false,
      highlightSets: [] as THighlightSet[],
      created: '2021-01-01T00:00:00Z',
      modified: '2021-01-01T00:00:00Z',
    },
    isLoading: false,
    fetchError: null,
  },
};
const initialState = {
  portalConfiguration:
    {
      enterpriseId: 'test-enterprise-uuid',
      enterpriseSlug: 'test-enterprise',
      enterpriseFeatures: {},
    },
};

const ContentHighlightsWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  location,
}) => (
  <IntlProvider locale="en">
    <Provider store={mockStore(initialState)}>
      <EnterpriseAppContext.Provider value={enterpriseAppContextValue}>
        <ContentHighlights location={location} />
      </EnterpriseAppContext.Provider>
    </Provider>
  </IntlProvider>
);

describe('<ContentHighlights>', () => {
  beforeEach(() => {
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });
    (useAlgoliaSearch as jest.Mock).mockReturnValue({
      isCatalogQueryFiltersEnabled: false,
      securedAlgoliaApiKey: null,
      isLoading: false,
      searchClient: null,
      catalogUuidsToCatalogQueryUuids: null,
    } as UseAlgoliaSearchResult);
  });
  it('Displays the Hero', () => {
    renderWithRouter(<ContentHighlightsWrapper location={{ state: {} }} />);
    expect(screen.getAllByText('Highlights')[0]).toBeInTheDocument();
  });
  it('Displays the toast addition', () => {
    renderWithRouter(<ContentHighlightsWrapper location={{ state: { addHighlightSet: true } }} />);
    expect(screen.getByText('added', { exact: false })).toBeInTheDocument();
  });
  it('Displays the toast deleted', () => {
    renderWithRouter(<ContentHighlightsWrapper location={{ state: { deletedHighlightSet: true } }} />);
    expect(screen.getByText('deleted', { exact: false })).toBeInTheDocument();
  });
  it('Displays the toast highlight', () => {
    const mockEnterpriseCuration: TEnterpriseCuration = {
      ...initialEnterpriseAppContextValue.enterpriseCuration.enterpriseCuration,
      toastText: 'highlighted',
    };
    const mockEnterpriseAppContext = {
      ...initialEnterpriseAppContextValue,
      enterpriseCuration: {
        ...initialEnterpriseAppContextValue.enterpriseCuration,
        enterpriseCuration: mockEnterpriseCuration,
      },
    } as TEnterpriseAppContext;
    renderWithRouter(
      <ContentHighlightsWrapper
        enterpriseAppContextValue={mockEnterpriseAppContext}
        location={{ state: { highlightToast: true } }}
      />,
    );
    expect(screen.getByText('highlighted')).toBeInTheDocument();
  });
  it('Displays the archive toast', () => {
    renderWithRouter(
      <ContentHighlightsWrapper
        location={{ state: { archiveCourses: true } }}
      />,
    );
    expect(screen.getByText('Archived courses deleted')).toBeInTheDocument();
  });
  it('Displays the alert if custom groups is enabled and user is staff', () => {
    (LmsApiService.fetchEnterpriseGroups as jest.Mock).mockImplementation(() => Promise.resolve({
      data: { results: [{ groupType: GROUP_TYPE_BUDGET }] },
    }));
    renderWithRouter(<ContentHighlightsWrapper location={{ state: {} }} />);
  });
});

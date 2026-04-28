import algoliasearch from 'algoliasearch/lite';
import React, { useState } from 'react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import Router, { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  render, screen, fireEvent, renderHook, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import ContentHighlightSet from '../ContentHighlightSet';
import { useHighlightSet } from '../data/hooks';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';
import { configuration } from '../../../config';

jest.mock('../../../data/services/EnterpriseCatalogApiService');
jest.mock('../DeleteHighlightSet', () => ({
  __esModule: true,
  default: () => <div data-testid="deleteHighlightSet" />,
}));

const mockHighlightSetResponse = camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA);
const mockStore = configureMockStore([thunk]);
const highlightSetUUID = 'fake-uuid';
const searchClient = algoliasearch(
  configuration.ALGOLIA.APP_ID,
  configuration.ALGOLIA.SEARCH_API_KEY,
);

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
    enterpriseId: 'test-enterprise-id',
  },
  highlightSetUUID,
};
const mockDispatchFn = jest.fn();
const initialEnterpriseAppContextValue = {
  enterpriseCuration: {
    dispatch: mockDispatchFn,
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const ContentHighlightSetWrapper = ({ children, ...props }) => {
  const contextValue = useState({
    stepperModal: {
      isOpen: false,
      highlightTitle: null,
      titleStepValidationError: null,
      currentSelectedRowIds: {},
      isEditMode: false,
      highlightSetUuid: null,
      existingContentKeys: [],
    },
    contentHighlights: [],
    algolia: {
      searchClient,
      securedAlgoliaApiKey: null,
      isLoading: false,
    },
  });
  return (
    <IntlProvider locale="en">
      <EnterpriseAppContext.Provider value={initialEnterpriseAppContextValue}>
        <ContentHighlightsContext.Provider value={contextValue}>
          <Provider store={mockStore(initialState)}>
            <MemoryRouter initialEntries={[`/test-enterprise/admin/${ROUTE_NAMES.contentHighlights}/${highlightSetUUID}`]}>
              <Routes>
                <Route
                  path={`/:enterpriseSlug/admin/${ROUTE_NAMES.contentHighlights}/:highlightSetUUID`}
                  element={<ContentHighlightSet {...props} />}
                />
              </Routes>
            </MemoryRouter>
          </Provider>
        </ContentHighlightsContext.Provider>
      </EnterpriseAppContext.Provider>
    </IntlProvider>
  );
};

// Mock highlight set with featured items
const mockHighlightSetWithFeatured = {
  title: 'Recommended for Marketing',
  uuid: highlightSetUUID,
  isPublished: true,
  highlightedContent: [
    {
      uuid: 'content-1',
      contentKey: 'edX+Course1',
      title: 'Featured Course Alpha',
      contentType: 'Course',
      cardImageUrl: 'https://example.com/image1.jpg',
      isFavorite: true,
      authoringOrganizations: [{ uuid: 'org-1', name: 'TestOrg' }],
    },
    {
      uuid: 'content-2',
      contentKey: 'edX+Course2',
      title: 'Regular Course Beta',
      contentType: 'Course',
      cardImageUrl: 'https://example.com/image2.jpg',
      isFavorite: false,
      authoringOrganizations: [{ uuid: 'org-2', name: 'TestOrg' }],
    },
    {
      uuid: 'content-3',
      contentKey: 'edX+Program1',
      title: 'Featured Program Gamma',
      contentType: 'Program',
      cardImageUrl: 'https://example.com/image3.jpg',
      isFavorite: true,
      authoringOrganizations: [{ uuid: 'org-3', name: 'TestOrg' }],
    },
  ],
};

describe('<ContentHighlightSet>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Router, 'useParams').mockReturnValue({ highlightSetUUID });
  });

  it('Displays the title of the highlight set', async () => {
    EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
      data: mockHighlightSetResponse,
    });
    const { result } = renderHook(() => useHighlightSet(highlightSetUUID));
    expect(result.current).toEqual({
      isLoading: true,
      error: null,
      highlightSet: [],
      updateHighlightSet: expect.any(Function),
      refetch: expect.any(Function),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current).toEqual({
      isLoading: false,
      error: null,
      highlightSet: camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA),
      updateHighlightSet: expect.any(Function),
      refetch: expect.any(Function),
    });
    expect(
      EnterpriseCatalogApiService.fetchHighlightSet,
    ).toHaveBeenCalled();
  });

  describe('featured content removal confirmation modal', () => {
    it('shows confirmation modal when removing featured content', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
        data: mockHighlightSetWithFeatured,
      });
      render(<ContentHighlightSetWrapper />);

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-content-button'));

      // Select a featured course
      fireEvent.click(screen.getByLabelText('Select Featured Course Alpha for removal'));

      // Click remove content
      fireEvent.click(screen.getByTestId('remove-content-button'));

      // Modal should appear with featured course listed
      await waitFor(() => {
        expect(screen.getByText('Remove a featured course?')).toBeInTheDocument();
      });
      expect(screen.getByText('Do you want to remove these featured courses from your highlight?')).toBeInTheDocument();
      // Featured course name appears in both card and modal list item
      const featuredAlphaElements = screen.getAllByText('Featured Course Alpha');
      expect(featuredAlphaElements.length).toBeGreaterThanOrEqual(2);
    });

    it('does NOT show modal when removing non-featured content', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
        data: mockHighlightSetWithFeatured,
      });
      EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({});
      render(<ContentHighlightSetWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      // Enter edit mode
      fireEvent.click(screen.getByTestId('edit-content-button'));

      // Select only the non-featured course
      fireEvent.click(screen.getByLabelText('Select Regular Course Beta for removal'));

      // Click remove content - should remove directly without modal
      fireEvent.click(screen.getByTestId('remove-content-button'));

      // Modal should NOT appear
      expect(screen.queryByText('Remove a featured course?')).not.toBeInTheDocument();

      // API should be called directly
      await waitFor(() => {
        expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalled();
      });

      // Toast should appear
      await waitFor(() => {
        expect(screen.getByText('Content removed successfully')).toBeInTheDocument();
      });
    });

    it('cancels the featured removal modal without removing content', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
        data: mockHighlightSetWithFeatured,
      });
      render(<ContentHighlightSetWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-content-button'));
      fireEvent.click(screen.getByLabelText('Select Featured Course Alpha for removal'));
      fireEvent.click(screen.getByTestId('remove-content-button'));

      await waitFor(() => {
        expect(screen.getByText('Remove a featured course?')).toBeInTheDocument();
      });

      // Click Cancel in modal
      fireEvent.click(screen.getByTestId('featured-modal-cancel'));

      // Modal closes, no API call
      await waitFor(() => {
        expect(screen.queryByText('Remove a featured course?')).not.toBeInTheDocument();
      });
      expect(EnterpriseCatalogApiService.updateHighlightSet).not.toHaveBeenCalled();
    });

    it('confirms featured removal and calls API', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
        data: mockHighlightSetWithFeatured,
      });
      EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({});
      render(<ContentHighlightSetWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-content-button'));
      fireEvent.click(screen.getByLabelText('Select Featured Course Alpha for removal'));
      fireEvent.click(screen.getByTestId('remove-content-button'));

      await waitFor(() => {
        expect(screen.getByText('Remove a featured course?')).toBeInTheDocument();
      });

      // Click "Yes, remove content"
      fireEvent.click(screen.getByTestId('featured-modal-confirm'));

      await waitFor(() => {
        expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
          highlightSetUUID,
          {
            remove_content_keys: ['edX+Course1'],
          },
        );
      });

      // Toast should appear after successful removal
      await waitFor(() => {
        expect(screen.getByText('Content removed successfully')).toBeInTheDocument();
      });
    });

    it('lists all selected featured items in the modal', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
        data: mockHighlightSetWithFeatured,
      });
      render(<ContentHighlightSetWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-content-button'));

      // Select both featured items
      fireEvent.click(screen.getByLabelText('Select Featured Course Alpha for removal'));
      fireEvent.click(screen.getByLabelText('Select Featured Program Gamma for removal'));

      fireEvent.click(screen.getByTestId('remove-content-button'));

      await waitFor(() => {
        expect(screen.getByText('Remove a featured course?')).toBeInTheDocument();
      });
      // Both featured items appear in modal list (each also appears in the card grid)
      const alphaElements = screen.getAllByText('Featured Course Alpha');
      const gammaElements = screen.getAllByText('Featured Program Gamma');
      expect(alphaElements.length).toBeGreaterThanOrEqual(2);
      expect(gammaElements.length).toBeGreaterThanOrEqual(2);
    });
  });
});

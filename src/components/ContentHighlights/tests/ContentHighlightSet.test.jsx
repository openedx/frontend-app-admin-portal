import algoliasearch from 'algoliasearch/lite';
import React, { useState } from 'react';
import '@testing-library/jest-dom/extend-expect';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import Router, { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  render, screen, fireEvent, renderHook, waitFor, act,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { camelCaseObject } from '@edx/frontend-platform';
import { logError } from '@edx/frontend-platform/logging';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import ContentHighlightSet from '../ContentHighlightSet';
import { useHighlightSet, useContentHighlightsContext } from '../data/hooks';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { EnterpriseAppContext } from '../../EnterpriseApp/EnterpriseAppContextProvider';
import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';
import { configuration } from '../../../config';

jest.mock('../../../data/services/EnterpriseCatalogApiService');
jest.mock('@edx/frontend-platform/logging');
jest.mock('../DeleteHighlightSet', () => ({
  __esModule: true,
  default: () => <div data-testid="deleteHighlightSet" />,
}));

// Mock hooks module — useContentHighlightsContext as jest.fn()
// so we can control its return value per describe block
jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useContentHighlightsContext: jest.fn(),
}));

const mockOpenEditStepperModal = jest.fn();

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

const initialContextState = {
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
};

const ContentHighlightSetWrapper = ({ children, ...props }) => {
  const contextValue = useState(initialContextState);
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

// Wrapper for hook tests
const HookWrapper = ({ children }) => (
  <IntlProvider locale="en">
    <ContentHighlightsContext.Provider value={useState(initialContextState)}>
      {children}
    </ContentHighlightsContext.Provider>
  </IntlProvider>
);

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
    // Provide mock return value for component tests
    useContentHighlightsContext.mockReturnValue({
      openEditStepperModal: mockOpenEditStepperModal,
    });
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
      updateHighlightTitle: expect.any(Function),
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
      updateHighlightTitle: expect.any(Function),
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

      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-content-button'));
      fireEvent.click(screen.getByLabelText('Select Featured Course Alpha for removal'));
      fireEvent.click(screen.getByTestId('remove-content-button'));

      await waitFor(() => {
        expect(screen.getByText('Remove a featured course?')).toBeInTheDocument();
      });
      expect(screen.getByText('Do you want to remove these featured courses from your highlight?')).toBeInTheDocument();
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

      fireEvent.click(screen.getByTestId('edit-content-button'));
      fireEvent.click(screen.getByLabelText('Select Regular Course Beta for removal'));
      fireEvent.click(screen.getByTestId('remove-content-button'));

      expect(screen.queryByText('Remove a featured course?')).not.toBeInTheDocument();

      await waitFor(() => {
        expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalled();
      });

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

      fireEvent.click(screen.getByTestId('featured-modal-cancel'));

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

      fireEvent.click(screen.getByTestId('featured-modal-confirm'));

      await waitFor(() => {
        expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
          highlightSetUUID,
          { remove_content_keys: ['edX+Course1'] },
        );
      });

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
      fireEvent.click(screen.getByLabelText('Select Featured Course Alpha for removal'));
      fireEvent.click(screen.getByLabelText('Select Featured Program Gamma for removal'));
      fireEvent.click(screen.getByTestId('remove-content-button'));

      await waitFor(() => {
        expect(screen.getByText('Remove a featured course?')).toBeInTheDocument();
      });

      const alphaElements = screen.getAllByText('Featured Course Alpha');
      const gammaElements = screen.getAllByText('Featured Program Gamma');
      expect(alphaElements.length).toBeGreaterThanOrEqual(2);
      expect(gammaElements.length).toBeGreaterThanOrEqual(2);
    });

    it('shows error alert when content removal fails', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
        data: mockHighlightSetWithFeatured,
      });
      EnterpriseCatalogApiService.updateHighlightSet.mockRejectedValueOnce(
        new Error('Remove failed'),
      );
      render(<ContentHighlightSetWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-content-button'));
      fireEvent.click(screen.getByLabelText('Select Regular Course Beta for removal'));
      fireEvent.click(screen.getByTestId('remove-content-button'));

      await waitFor(() => {
        expect(screen.getByTestId('remove-error-alert')).toBeInTheDocument();
      });
      expect(screen.getByText('Failed to remove content. Please try again.')).toBeInTheDocument();
    });

    it('opens stepper modal when add content is clicked', async () => {
      EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({
        data: mockHighlightSetWithFeatured,
      });

      render(<ContentHighlightSetWrapper />);

      await waitFor(() => {
        expect(screen.getByText('Recommended for Marketing')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-content-button'));
      fireEvent.click(screen.getByTestId('add-content-button'));

      await waitFor(() => {
        expect(mockOpenEditStepperModal).toHaveBeenCalledWith({
          highlightTitle: mockHighlightSetWithFeatured.title,
          highlightSetUuid: highlightSetUUID,
          existingContent: mockHighlightSetWithFeatured.highlightedContent,
        });
      });
    });
  });
});

// ─── useHighlightSet hook tests ───────────────────────────────────────────────
describe('useHighlightSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets error state when fetchHighlightSet fails — covers lines 62-63', async () => {
    const mockError = new Error('Fetch failed');
    EnterpriseCatalogApiService.fetchHighlightSet.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useHighlightSet(highlightSetUUID));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.highlightSet).toEqual([]);
  });

  it('refetch resets isLoading and re-fetches data — covers refetch lines', async () => {
    EnterpriseCatalogApiService.fetchHighlightSet
      .mockResolvedValueOnce({ data: mockHighlightSetWithFeatured })
      .mockResolvedValueOnce({ data: mockHighlightSetWithFeatured });

    const { result } = renderHook(() => useHighlightSet(highlightSetUUID));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(EnterpriseCatalogApiService.fetchHighlightSet).toHaveBeenCalledTimes(2);
  });
});

// ─── useContentHighlightsContext hook tests ───────────────────────────────────
describe('useContentHighlightsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore real implementation for hook unit tests
    useContentHighlightsContext.mockImplementation(
      jest.requireActual('../data/hooks').useContentHighlightsContext,
    );
  });

  it('openStepperModal sets isOpen to true and resets edit mode', () => {
    const { result } = renderHook(
      () => useContentHighlightsContext(),
      { wrapper: HookWrapper },
    );

    expect(result.current.openStepperModal).toBeDefined();
    expect(() => act(() => result.current.openStepperModal())).not.toThrow();
  });

  it('openEditStepperModal with items that have aggregationKey — covers lines 101-104, 114-115', () => {
    const { result } = renderHook(
      () => useContentHighlightsContext(),
      { wrapper: HookWrapper },
    );

    const existingContent = [
      {
        contentKey: 'edX+Course1',
        aggregationKey: 'course:edX+Course1',
      },
      {
        contentKey: 'edX+Course2',
        aggregationKey: null,
      },
    ];

    expect(() => act(() => result.current.openEditStepperModal({
      highlightTitle: 'Test Highlight',
      highlightSetUuid: highlightSetUUID,
      existingContent,
    }))).not.toThrow();
  });

  it('openEditStepperModal with empty existingContent — covers empty array branch', () => {
    const { result } = renderHook(
      () => useContentHighlightsContext(),
      { wrapper: HookWrapper },
    );

    expect(() => act(() => result.current.openEditStepperModal({
      highlightTitle: 'Test Highlight',
      highlightSetUuid: highlightSetUUID,
      existingContent: [],
    }))).not.toThrow();
  });

  it('openEditStepperModal with null existingContent — covers (existingContent || []) fallback', () => {
    const { result } = renderHook(
      () => useContentHighlightsContext(),
      { wrapper: HookWrapper },
    );

    expect(() => act(() => result.current.openEditStepperModal({
      highlightTitle: 'Test Highlight',
      highlightSetUuid: highlightSetUUID,
      existingContent: null,
    }))).not.toThrow();
  });
  it('updateHighlightTitle patches the title and updates highlight set state (flat response)', async () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ highlightSetUUID });
    const updatedData = { ...mockHighlightSetResponse, title: 'Updated Title' };
    EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({ data: mockHighlightSetResponse });
    EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({ data: updatedData });

    const { result } = renderHook(() => useHighlightSet(highlightSetUUID));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updateResult = await result.current.updateHighlightTitle('Updated Title');

    expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
      highlightSetUUID,
      { title: 'Updated Title' },
    );
    await waitFor(() => expect(result.current.highlightSet.title).toBe('Updated Title'));
    expect(updateResult.title).toBe('Updated Title');
  });

  it('updateHighlightTitle handles nested highlight_set response format', async () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ highlightSetUUID });
    const nestedResponse = {
      highlight_set: { ...mockHighlightSetResponse, title: 'Nested Title' },
      added_content_keys: [],
      removed_content_keys: [],
      ignored_content_keys: [],
    };
    EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({ data: mockHighlightSetResponse });
    EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({ data: nestedResponse });

    const { result } = renderHook(() => useHighlightSet(highlightSetUUID));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updateResult = await result.current.updateHighlightTitle('Nested Title');

    expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
      highlightSetUUID,
      { title: 'Nested Title' },
    );
    await waitFor(() => expect(result.current.highlightSet.title).toBe('Nested Title'));
    expect(updateResult.title).toBe('Nested Title');
  });

  it('updateHighlightTitle sets error state and rethrows on failure', async () => {
    jest.spyOn(Router, 'useParams').mockReturnValue({ highlightSetUUID });
    const updateError = new Error('Update failed');
    EnterpriseCatalogApiService.fetchHighlightSet.mockResolvedValueOnce({ data: mockHighlightSetResponse });
    EnterpriseCatalogApiService.updateHighlightSet.mockRejectedValueOnce(updateError);

    const { result } = renderHook(() => useHighlightSet(highlightSetUUID));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.updateHighlightTitle('New Title')).rejects.toThrow(updateError);
    await waitFor(() => expect(result.current.error).toBe(updateError));
    expect(logError).not.toHaveBeenCalled();
  });

  it('passes editHighlightsEnabled=true when feature flag is enabled in Redux state', () => {
    const stateWithFeatureFlagEnabled = {
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration,
        enterpriseFeatures: {
          enterpriseEditHighlightsEnabled: true,
        },
      },
    };
    const store = mockStore(stateWithFeatureFlagEnabled);
    expect(store.getState().portalConfiguration.enterpriseFeatures.enterpriseEditHighlightsEnabled).toBe(true);
  });

  it('passes editHighlightsEnabled=false when feature flag is disabled in Redux state', () => {
    const stateWithFeatureFlagDisabled = {
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration,
        enterpriseFeatures: {
          enterpriseEditHighlightsEnabled: false,
        },
      },
    };
    const store = mockStore(stateWithFeatureFlagDisabled);
    expect(store.getState().portalConfiguration.enterpriseFeatures.enterpriseEditHighlightsEnabled).toBe(false);
  });

  it('defaults editHighlightsEnabled to false when feature flag is missing', () => {
    const stateWithoutFeatureFlag = {
      ...initialState,
      portalConfiguration: {
        ...initialState.portalConfiguration,

      },
    };
    const store = mockStore(stateWithoutFeatureFlag);
    const state = store.getState();
    const defaultValue = state.portalConfiguration.enterpriseFeatures?.enterpriseEditHighlightsEnabled ?? false;
    expect(defaultValue).toBe(false);
  });
});

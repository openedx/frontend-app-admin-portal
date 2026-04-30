import React, { useState } from 'react';
import '@testing-library/jest-dom/extend-expect';
import Router, { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  renderHook, waitFor, act,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { ContentHighlightsContext } from '../../ContentHighlightsContext';
import useContentHighlightSetEditing from '../useContentHighlightSetEditing';
import { ROUTE_NAMES } from '../../../EnterpriseApp/data/constants';
import EnterpriseCatalogApiService from '../../../../data/services/EnterpriseCatalogApiService';
import { useContentHighlightsContext } from '../hooks';

jest.mock('../../../../data/services/EnterpriseCatalogApiService');
jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useContentHighlightsContext: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const mockOpenEditStepperModal = jest.fn();
const mockUpdateHighlightSet = jest.fn();
const mockOpenToast = jest.fn();
const highlightSetUUID = 'fake-uuid';

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
    searchClient: null,
    securedAlgoliaApiKey: null,
    isLoading: false,
  },
};

const mockHighlightSet = {
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

const HookWrapper = ({ children }) => (
  <IntlProvider locale="en">
    <ContentHighlightsContext.Provider value={useState(initialContextState)}>
      <MemoryRouter initialEntries={[`/test-enterprise/admin/${ROUTE_NAMES.contentHighlights}/${highlightSetUUID}`]}>
        <Routes>
          <Route
            path={`/:enterpriseSlug/admin/${ROUTE_NAMES.contentHighlights}/:highlightSetUUID`}
            element={<div>{children}</div>}
          />
        </Routes>
      </MemoryRouter>
    </ContentHighlightsContext.Provider>
  </IntlProvider>
);

describe('useContentHighlightSetEditing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Router, 'useParams').mockReturnValue({ highlightSetUUID });
    useContentHighlightsContext.mockReturnValue({
      openEditStepperModal: mockOpenEditStepperModal,
    });
  });

  const renderEditingHook = (highlightSet = mockHighlightSet) => renderHook(
    () => useContentHighlightSetEditing({
      highlightSet,
      updateHighlightSet: mockUpdateHighlightSet,
      openToast: mockOpenToast,
    }),
    { wrapper: HookWrapper },
  );

  // ─── initial state ──────────────────────────────────────────────────────────
  it('returns correct initial state', () => {
    const { result } = renderEditingHook();

    expect(result.current.isEditing).toBe(false);
    expect(result.current.selectedContentKeys.size).toBe(0);
    expect(result.current.isRemoving).toBe(false);
    expect(result.current.removeError).toBeNull();
    expect(result.current.isFeaturedModalOpen).toBe(false);
    expect(result.current.toastMessage).toBe('');
    expect(result.current.selectedFeaturedItems).toEqual([]);
  });

  // ─── handleEditClick ────────────────────────────────────────────────────────
  it('handleEditClick sets isEditing to true and clears state', () => {
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleEditClick();
    });

    expect(result.current.isEditing).toBe(true);
    expect(result.current.selectedContentKeys.size).toBe(0);
    expect(result.current.removeError).toBeNull();
  });

  // ─── handleCancelClick ──────────────────────────────────────────────────────
  it('handleCancelClick sets isEditing to false and clears state', () => {
    const { result } = renderEditingHook();

    // Enter edit mode first
    act(() => {
      result.current.handleEditClick();
    });
    expect(result.current.isEditing).toBe(true);

    // Cancel
    act(() => {
      result.current.handleCancelClick();
    });
    expect(result.current.isEditing).toBe(false);
    expect(result.current.selectedContentKeys.size).toBe(0);
    expect(result.current.removeError).toBeNull();
  });

  // ─── handleToggleSelect ─────────────────────────────────────────────────────
  it('handleToggleSelect adds a content key when not selected', () => {
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleToggleSelect('edX+Course1');
    });

    expect(result.current.selectedContentKeys.has('edX+Course1')).toBe(true);
  });

  it('handleToggleSelect removes a content key when already selected', () => {
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleToggleSelect('edX+Course1');
    });
    expect(result.current.selectedContentKeys.has('edX+Course1')).toBe(true);

    act(() => {
      result.current.handleToggleSelect('edX+Course1');
    });
    expect(result.current.selectedContentKeys.has('edX+Course1')).toBe(false);
  });

  // ─── selectedFeaturedItems ──────────────────────────────────────────────────
  it('selectedFeaturedItems returns only selected items that are favorites', () => {
    const { result } = renderEditingHook();

    // Select a featured item and a non-featured item
    act(() => {
      result.current.handleToggleSelect('edX+Course1'); // isFavorite: true
      result.current.handleToggleSelect('edX+Course2'); // isFavorite: false
    });

    expect(result.current.selectedFeaturedItems).toHaveLength(1);
    expect(result.current.selectedFeaturedItems[0].contentKey).toBe('edX+Course1');
  });

  it('selectedFeaturedItems returns empty array when highlightSet has no highlightedContent', () => {
    const { result } = renderEditingHook({ title: 'Empty', highlightedContent: null });
    expect(result.current.selectedFeaturedItems).toEqual([]);
  });

  // ─── handleRemoveSelectedContent ────────────────────────────────────────────
  it('handleRemoveSelectedContent opens featured modal when featured items are selected', () => {
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleToggleSelect('edX+Course1'); // isFavorite: true
    });

    act(() => {
      result.current.handleRemoveSelectedContent();
    });

    expect(result.current.isFeaturedModalOpen).toBe(true);
  });

  it('handleRemoveSelectedContent calls API directly when no featured items selected', async () => {
    EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({});
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleToggleSelect('edX+Course2'); // isFavorite: false
    });

    await act(async () => {
      result.current.handleRemoveSelectedContent();
    });

    await waitFor(() => {
      expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
        highlightSetUUID,
        { remove_content_keys: ['edX+Course2'] },
      );
    });
  });

  // ─── executeRemoveContent ───────────────────────────────────────────────────
  it('executeRemoveContent removes selected content and resets state on success', async () => {
    EnterpriseCatalogApiService.updateHighlightSet.mockResolvedValueOnce({});
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleToggleSelect('edX+Course1');
    });

    await act(async () => {
      await result.current.executeRemoveContent();
    });

    await waitFor(() => {
      expect(EnterpriseCatalogApiService.updateHighlightSet).toHaveBeenCalledWith(
        highlightSetUUID,
        { remove_content_keys: ['edX+Course1'] },
      );
    });

    expect(mockUpdateHighlightSet).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ contentKey: 'edX+Course2' }),
        expect.objectContaining({ contentKey: 'edX+Program1' }),
      ]),
    );
    expect(result.current.isEditing).toBe(false);
    expect(result.current.selectedContentKeys.size).toBe(0);
    expect(result.current.isRemoving).toBe(false);
    expect(result.current.isFeaturedModalOpen).toBe(false);
    expect(mockOpenToast).toHaveBeenCalled();
  });

  it('executeRemoveContent sets removeError on failure', async () => {
    const mockError = new Error('Remove failed');
    EnterpriseCatalogApiService.updateHighlightSet.mockRejectedValueOnce(mockError);
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleToggleSelect('edX+Course1');
    });

    await act(async () => {
      await result.current.executeRemoveContent();
    });

    await waitFor(() => {
      expect(result.current.removeError).toEqual(mockError);
    });

    expect(result.current.isRemoving).toBe(false);
    expect(result.current.isFeaturedModalOpen).toBe(false);
    expect(mockOpenToast).not.toHaveBeenCalled();
  });

  // ─── handleAddContentClick ──────────────────────────────────────────────────
  it('handleAddContentClick exits edit mode and opens stepper modal', () => {
    const { result } = renderEditingHook();

    act(() => {
      result.current.handleEditClick();
    });
    expect(result.current.isEditing).toBe(true);

    act(() => {
      result.current.handleAddContentClick();
    });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.selectedContentKeys.size).toBe(0);
    expect(mockOpenEditStepperModal).toHaveBeenCalledWith({
      highlightTitle: mockHighlightSet.title,
      highlightSetUuid: highlightSetUUID,
      existingContent: mockHighlightSet.highlightedContent,
    });
  });

  it('handleAddContentClick passes empty array when highlightedContent is null', () => {
    const { result } = renderEditingHook({
      title: 'Empty Highlight',
      highlightedContent: null,
    });

    act(() => {
      result.current.handleAddContentClick();
    });

    expect(mockOpenEditStepperModal).toHaveBeenCalledWith({
      highlightTitle: 'Empty Highlight',
      highlightSetUuid: highlightSetUUID,
      existingContent: [],
    });
  });

  // ─── setIsFeaturedModalOpen ─────────────────────────────────────────────────
  it('setIsFeaturedModalOpen closes the featured modal', () => {
    const { result } = renderEditingHook();

    // Select a featured item first
    act(() => {
      result.current.handleToggleSelect('edX+Course1'); // isFavorite: true
    });

    // Then trigger remove — this should open the modal since Course1 is featured
    act(() => {
      result.current.handleRemoveSelectedContent();
    });

    // Verify modal is open before closing
    expect(result.current.isFeaturedModalOpen).toBe(true);

    // Now close the modal
    act(() => {
      result.current.setIsFeaturedModalOpen(false);
    });

    expect(result.current.isFeaturedModalOpen).toBe(false);
  });
});

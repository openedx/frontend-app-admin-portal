import {
  useCallback, useMemo, useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import EnterpriseCatalogApiService from '../../../data/services/EnterpriseCatalogApiService';
import { useContentHighlightsContext } from './hooks';

const useContentHighlightSetEditing = ({ highlightSet, updateHighlightSet, openToast }) => {
  const { highlightSetUUID } = useParams();
  const intl = useIntl();
  const { openEditStepperModal } = useContentHighlightsContext();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedContentKeys, setSelectedContentKeys] = useState(new Set());
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const selectedFeaturedItems = useMemo(() => {
    if (!highlightSet?.highlightedContent) { return []; }
    return highlightSet.highlightedContent.filter(
      item => selectedContentKeys.has(item.contentKey) && item.isFavorite,
    );
  }, [highlightSet, selectedContentKeys]);

  const handleEditClick = useCallback(() => {
    setSelectedContentKeys(new Set());
    setRemoveError(null);
    setIsEditing(true);
  }, []);

  const handleCancelClick = useCallback(() => {
    setSelectedContentKeys(new Set());
    setRemoveError(null);
    setIsEditing(false);
  }, []);

  const handleToggleSelect = useCallback((contentKey) => {
    setSelectedContentKeys((prev) => {
      const next = new Set(prev);
      if (next.has(contentKey)) {
        next.delete(contentKey);
      } else {
        next.add(contentKey);
      }
      return next;
    });
  }, []);

  const executeRemoveContent = useCallback(async () => {
    setIsRemoving(true);
    setRemoveError(null);
    try {
      const keysToRemove = (highlightSet?.highlightedContent || [])
        .filter(item => selectedContentKeys.has(item.contentKey))
        .map(item => item.contentKey);
      await EnterpriseCatalogApiService.updateHighlightSet(highlightSetUUID, {
        remove_content_keys: keysToRemove,
      });
      const remainingContent = (highlightSet?.highlightedContent || [])
        .filter(item => !selectedContentKeys.has(item.contentKey));
      updateHighlightSet(remainingContent);
      setSelectedContentKeys(new Set());
      setIsEditing(false);
      setToastMessage(intl.formatMessage({
        id: 'highlights.edit.remove.success.toast',
        defaultMessage: 'Content removed successfully',
        description: 'Toast message shown after content is successfully removed from a highlight.',
      }));
      openToast();
    } catch (e) {
      logError(e);
      setRemoveError(e);
    } finally {
      setIsRemoving(false);
      setIsFeaturedModalOpen(false);
    }
  }, [highlightSet, selectedContentKeys, highlightSetUUID, updateHighlightSet, intl, openToast]);

  const handleRemoveSelectedContent = useCallback(() => {
    if (selectedFeaturedItems.length > 0) {
      setIsFeaturedModalOpen(true);
    } else {
      executeRemoveContent();
    }
  }, [selectedFeaturedItems, executeRemoveContent]);

  const handleAddContentClick = useCallback(() => {
    setIsEditing(false);
    setSelectedContentKeys(new Set());
    openEditStepperModal({
      highlightTitle: highlightSet?.title,
      highlightSetUuid: highlightSetUUID,
      existingContent: highlightSet?.highlightedContent || [],
    });
  }, [openEditStepperModal, highlightSet, highlightSetUUID]);

  return {
    isEditing,
    selectedContentKeys,
    isRemoving,
    removeError,
    isFeaturedModalOpen,
    toastMessage,
    selectedFeaturedItems,
    setIsFeaturedModalOpen,
    handleEditClick,
    handleCancelClick,
    handleToggleSelect,
    handleRemoveSelectedContent,
    handleAddContentClick,
    executeRemoveContent,
  };
};

export default useContentHighlightSetEditing;

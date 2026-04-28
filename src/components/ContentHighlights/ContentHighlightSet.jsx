import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import {
  ActionRow, Alert, AlertModal, Button, Container, Toast, useToggle,
} from '@openedx/paragon';
import { useLocation, useParams } from 'react-router-dom';
import { logError } from '@edx/frontend-platform/logging';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';
import { useContentHighlightsContext, useHighlightSet } from './data/hooks';
import EnterpriseCatalogApiService from '../../data/services/EnterpriseCatalogApiService';

const ContentHighlightSet = () => {
  const { highlightSetUUID } = useParams();
  const {
    highlightSet, isLoading, updateHighlightSet, refetch,
  } = useHighlightSet(highlightSetUUID);
  const { openEditStepperModal } = useContentHighlightsContext();
  const location = useLocation();
  const intl = useIntl();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedContentKeys, setSelectedContentKeys] = useState(new Set());
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false);
  const [isToastOpen, openToast, closeToast] = useToggle(false);
  const [toastMessage, setToastMessage] = useState('');

  // Refetch data when stepper saves successfully (detected via location state)
  useEffect(() => {
    if (location.state?.highlightSetEdited) {
      refetch();
      // Replace the state so it doesn't trigger again on re-render
      window.history.replaceState({}, '');
    }
  }, [location.state, refetch]);
  // Identify which selected items are favorite (is_favorite from API, camelCased to isFavorite)
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

  return (
    <Container className="mt-5">
      <CurrentContentHighlightItemsHeader
        isLoading={isLoading}
        highlightTitle={highlightSet?.title || ''}
        isEditing={isEditing}
        onEditClick={handleEditClick}
        onCancelClick={handleCancelClick}
        onRemoveSelectedContent={handleRemoveSelectedContent}
        onAddContentClick={handleAddContentClick}
        selectedCount={selectedContentKeys.size}
        isRemoving={isRemoving}
      />
      {removeError && (
        <Alert variant="danger" data-testid="remove-error-alert" className="mb-3">
          Failed to remove content. Please try again.
        </Alert>
      )}
      <ContentHighlightsCardItemContainer
        isLoading={isLoading}
        highlightedContent={highlightSet?.highlightedContent}
        updateHighlightSet={updateHighlightSet}
        isEditing={isEditing}
        selectedContentKeys={selectedContentKeys}
        onToggleSelect={handleToggleSelect}
      />
      <AlertModal
        title={intl.formatMessage({
          id: 'highlights.edit.remove.featured.modal.title',
          defaultMessage: 'Remove a featured course?',
          description: 'Title for modal confirming removal of featured courses from a highlight.',
        })}
        isOpen={isFeaturedModalOpen}
        onClose={() => setIsFeaturedModalOpen(false)}
        footerNode={(
          <ActionRow>
            <Button
              variant="tertiary"
              onClick={() => setIsFeaturedModalOpen(false)}
              data-testid="featured-modal-cancel"
            >
              <FormattedMessage
                id="highlights.edit.remove.featured.modal.cancel"
                defaultMessage="Cancel"
                description="Cancel button on featured content removal confirmation modal."
              />
            </Button>
            <Button
              variant="primary"
              onClick={executeRemoveContent}
              data-testid="featured-modal-confirm"
            >
              <FormattedMessage
                id="highlights.edit.remove.featured.modal.confirm"
                defaultMessage="Yes, remove content"
                description="Confirm button to remove featured content from highlight."
              />
            </Button>
          </ActionRow>
        )}
      >
        <p>
          <FormattedMessage
            id="highlights.edit.remove.featured.modal.body"
            defaultMessage="Do you want to remove these featured courses from your highlight?"
            description="Body text for the featured content removal confirmation modal."
          />
        </p>
        <ul>
          {selectedFeaturedItems.map(item => (
            <li key={item.contentKey}>{item.title}</li>
          ))}
        </ul>
      </AlertModal>
      <Toast onClose={closeToast} show={isToastOpen} data-testid="remove-success-toast">
        {toastMessage}
      </Toast>
    </Container>
  );
};

export default ContentHighlightSet;

import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  ActionRow, Alert, AlertModal, Button, Container, Toast, useToggle,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import ContentHighlightsCardItemContainer from './ContentHighlightsCardItemsContainer';
import CurrentContentHighlightItemsHeader from './CurrentContentHighlightItemsHeader';
import { useHighlightSet } from './data/hooks';
import { getExistingHighlightTitles } from './data/utils';
import useContentHighlightSetEditing from './data/useContentHighlightSetEditing';
import { EnterpriseAppContext } from '../EnterpriseApp/EnterpriseAppContextProvider';

const ContentHighlightSet = ({ editHighlightsEnabled }) => {
  const { highlightSetUUID } = useParams();
  const {
    highlightSet, isLoading, updateHighlightSet, refetch, updateHighlightTitle,
  } = useHighlightSet(highlightSetUUID);
  const onSaveTitle = editHighlightsEnabled ? updateHighlightTitle : null;
  const location = useLocation();
  const intl = useIntl();
  const [isToastOpen, openToast, closeToast] = useToggle(false);
  const { enterpriseCuration: { enterpriseCuration } } = useContext(EnterpriseAppContext);
  const existingHighlightTitles = getExistingHighlightTitles(enterpriseCuration);

  const {
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
  } = useContentHighlightSetEditing({ highlightSet, updateHighlightSet, openToast });

  // Refetch data when stepper saves successfully (detected via location state)
  useEffect(() => {
    if (location.state?.highlightSetEdited) {
      refetch();
      // Replace the state so it doesn't trigger again on re-render
      window.history.replaceState({}, '');
    }
  }, [location.state, refetch]);

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
        onSaveTitle={onSaveTitle}
        editHighlightsEnabled={editHighlightsEnabled}
        existingHighlightTitles={existingHighlightTitles}
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

const mapStateToProps = (state) => ({
  editHighlightsEnabled: state.portalConfiguration.enterpriseFeatures?.enterpriseEditHighlightsEnabled ?? false,
});

ContentHighlightSet.propTypes = {
  editHighlightsEnabled: PropTypes.bool,
};

export default connect(mapStateToProps)(ContentHighlightSet);

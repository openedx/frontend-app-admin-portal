import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Form,
  ModalDialog,
  Spinner,
  StatefulButton,
  useToggle,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';

import { MAX_HIGHLIGHT_TITLE_LENGTH } from './data/constants';
import GeneralErrorModal from '../PeopleManagement/GeneralErrorModal';

const EditHighlightTitleModal = ({
  isOpen,
  onClose,
  currentTitle,
  onSave,
}) => {
  const intl = useIntl();
  const [isErrorOpen, openError, closeError] = useToggle(false);
  const [title, setTitle] = useState(currentTitle);
  const [titleLength, setTitleLength] = useState(currentTitle.length);
  const [saveState, setSaveState] = useState('default');

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setTitleLength(currentTitle.length);
    }
  }, [isOpen, currentTitle]);

  const isEmpty = title.trim().length === 0;

  const handleChange = (e) => {
    if (e.target.value?.length > MAX_HIGHLIGHT_TITLE_LENGTH) {
      return;
    }
    setTitleLength(e.target.value?.length || 0);
    setTitle(e.target.value);
  };

  const handleSave = async () => {
    setSaveState('pending');
    try {
      await onSave(title.trim());
      setSaveState('complete');
      setTimeout(() => {
        setSaveState('default');
        onClose();
      }, 800);
    } catch (error) {
      logError(error);
      openError();
      setSaveState('default');
    }
  };

  return (
    <>
      <GeneralErrorModal isOpen={isErrorOpen} close={closeError} />
      <ModalDialog
        title="Edit highlight name"
        isOpen={isOpen}
        onClose={onClose}
        hasCloseButton
        isFullscreenOnMobile
        isOverflowVisible={false}
        data-testid="edit-highlight-title-modal"
      >
        <ModalDialog.Header>
          <ModalDialog.Title>
            <FormattedMessage
              id="highlights.edit.highlight.name.modal.title"
              defaultMessage="Edit highlight name"
              description="Title of the modal for editing a highlight set name."
            />
          </ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          <Form.Control
            value={title}
            onChange={handleChange}
            data-testid="edit-highlight-title-input"
            placeholder="Highlight name"
          />
          <Form.Control.Feedback>
            {titleLength} / {MAX_HIGHLIGHT_TITLE_LENGTH}
          </Form.Control.Feedback>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ActionRow>
            <ModalDialog.CloseButton variant="tertiary">
              <FormattedMessage
                id="highlights.edit.highlight.name.modal.cancel.button"
                defaultMessage="Cancel"
                description="Cancel button text in the edit highlight name modal."
              />
            </ModalDialog.CloseButton>
            <StatefulButton
              state={saveState}
              labels={{
                default: intl.formatMessage({
                  id: 'highlights.edit.highlight.name.modal.save.button',
                  defaultMessage: 'Save',
                  description: 'Save button text in the edit highlight name modal.',
                }),
                pending: intl.formatMessage({
                  id: 'highlights.edit.highlight.name.modal.save.in.progress.button',
                  defaultMessage: 'Saving',
                  description: 'Save button text when saving is in progress in the edit highlight name modal.',
                }),
                complete: intl.formatMessage({
                  id: 'highlights.edit.highlight.name.modal.save.complete.button',
                  defaultMessage: 'Saved',
                  description: 'Save button text when saving is complete in the edit highlight name modal.',
                }),
              }}
              icons={{
                pending: (
                  <Spinner animation="border" variant="light" size="sm" />
                ),
              }}
              disabledStates={['pending']}
              disabled={isEmpty}
              onClick={handleSave}
              data-testid="edit-highlight-title-save-button"
            />
          </ActionRow>
        </ModalDialog.Footer>
      </ModalDialog>
    </>
  );
};

EditHighlightTitleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentTitle: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditHighlightTitleModal;

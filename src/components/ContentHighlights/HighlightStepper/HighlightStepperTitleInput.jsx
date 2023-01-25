import React, { useState, useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { Form } from '@edx/paragon';

import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { DEFAULT_ERROR_MESSAGE, MAX_HIGHLIGHT_TITLE_LENGTH } from '../data/constants';
import { useContentHighlightsContext } from '../data/hooks';

const HighlightStepperTitleInput = () => {
  const { setHighlightTitle } = useContentHighlightsContext();
  const highlightTitle = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.highlightTitle);
  const [titleLength, setTitleLength] = useState(highlightTitle?.length || 0);
  const [isInvalid, setIsInvalid] = useState(false);
  const [highlightValue, setHighlightValue] = useState({
    initialized: false,
    highlightTitle: highlightTitle || '',
    titleStepValidationError: undefined,
    highlightTitleLength: titleLength || 0,
  });
  const handleChange = ((e) => {
    e.persist();
    if (e.target.value.length > MAX_HIGHLIGHT_TITLE_LENGTH) {
      setIsInvalid(true);
      setHighlightValue({
        initialized: true,
        highlightTitle: e.target.value,
        titleStepValidationError: DEFAULT_ERROR_MESSAGE.EXCEEDS_HIGHLIGHT_TITLE_LENGTH,
        highlightTitleLength: e.target.value.length,
      });
    } else {
      setIsInvalid(false);
      setHighlightValue({
        initialized: true,
        highlightTitle: e.target.value,
        titleStepValidationError: undefined,
        highlightTitleLength: e.target.value.length,
      });
    }
  });

  useEffect(() => {
    if (highlightValue.initialized) {
      setHighlightTitle({
        highlightTitle: highlightValue.highlightTitle,
        titleStepValidationError: highlightValue.titleStepValidationError,
      });
      setTitleLength(highlightValue.highlightTitleLength);
      setHighlightValue({
        ...highlightValue,
        initialized: false,
      });
    }
  }, [highlightTitle, setHighlightTitle, highlightValue]);
  return (
    <Form.Group
      isInvalid={isInvalid}
    >
      <Form.Control
        data-testid="stepper-title-input"
        value={highlightValue.highlightTitle || ''}
        onChange={handleChange}
        floatingLabel="Highlight title"
        autoComplete="off"
      />
      <Form.Control.Feedback type={isInvalid ? 'invalid' : undefined}>
        {highlightValue.highlightTitleLength}/{MAX_HIGHLIGHT_TITLE_LENGTH}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default HighlightStepperTitleInput;

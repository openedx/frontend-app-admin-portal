import React, { useState } from 'react';
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

  const handleChange = (e) => {
    if (e.target.value.length > MAX_HIGHLIGHT_TITLE_LENGTH) {
      setIsInvalid(true);
      setHighlightTitle({
        highlightTitle: e.target.value,
        titleStepValidationError: DEFAULT_ERROR_MESSAGE.EXCEEDS_HIGHLIGHT_TITLE_LENGTH,
      });
    } else {
      setIsInvalid(false);
      setHighlightTitle({
        highlightTitle: e.target.value,
        titleStepValidationError: undefined,
      });
    }
    setTitleLength(e.target.value.length);
  };

  return (
    <Form.Group
      isInvalid={isInvalid}
    >
      <Form.Control
        data-testid="stepper-title-input"
        value={highlightTitle || ''}
        onChange={handleChange}
        floatingLabel="Highlight title"
        autoComplete="off"
      />
      <Form.Control.Feedback type={isInvalid ? 'invalid' : undefined}>
        {titleLength}/{MAX_HIGHLIGHT_TITLE_LENGTH}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default HighlightStepperTitleInput;

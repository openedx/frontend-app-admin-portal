import React, { useState, useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { Form } from '@openedx/paragon';

import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { DEFAULT_ERROR_MESSAGE, MAX_HIGHLIGHT_TITLE_LENGTH } from '../data/constants';
import { useContentHighlightsContext } from '../data/hooks';

const HighlightStepperTitleInput = () => {
  const { setHighlightTitle } = useContentHighlightsContext();
  const highlightTitle = useContextSelector(ContentHighlightsContext, v => v[0].stepperModal.highlightTitle);
  const [titleLength, setTitleLength] = useState(highlightTitle?.length || 0);
  const [isInvalid, setIsInvalid] = useState(false);
  /**
   *  Create seperate useState for FormInput as to differenciate between
   *  the outer stepper context state and inner input useState.
   * */
  const [highlightValue, setHighlightValue] = useState({
    initialized: false,
    highlightTitle: highlightTitle || '',
    titleStepValidationError: undefined,
    highlightTitleLength: titleLength || 0,
  });
  const handleChange = (e) => {
    const eventTargetValue = e.target.value;
    if (eventTargetValue.length > MAX_HIGHLIGHT_TITLE_LENGTH) {
      setIsInvalid(true);
      setHighlightValue({
        initialized: true,
        highlightTitle: eventTargetValue,
        titleStepValidationError: DEFAULT_ERROR_MESSAGE.EXCEEDS_HIGHLIGHT_TITLE_LENGTH,
        highlightTitleLength: eventTargetValue.length,
      });
    } else {
      setIsInvalid(false);
      setHighlightValue({
        initialized: true,
        highlightTitle: eventTargetValue,
        titleStepValidationError: undefined,
        highlightTitleLength: eventTargetValue.length,
      });
    }
  };

  useEffect(() => {
    if (highlightValue.initialized) {
      setHighlightTitle({
        highlightTitle: highlightValue.highlightTitle,
        titleStepValidationError: highlightValue.titleStepValidationError,
      });
      setTitleLength(highlightValue.highlightTitleLength);
      setHighlightValue(prevState => ({
        ...prevState,
        initialized: false,
      }));
    }
  }, [highlightTitle, setHighlightTitle, highlightValue]);
  return (
    <Form.Group
      isInvalid={isInvalid}
    >
      <Form.Control
        data-testid="stepper-title-input"
        value={highlightValue.highlightTitle}
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

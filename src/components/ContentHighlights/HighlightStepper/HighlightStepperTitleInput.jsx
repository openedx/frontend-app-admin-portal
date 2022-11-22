import React, { useContext, useState } from 'react';
import { Form } from '@edx/paragon';
import { ContentHighlightsContext } from '../ContentHighlightsContext';
import { setStepperHighlightTitle } from '../data/actions';
import { HIGHLIGHT_TITLE_MAX_LENGTH } from '../data/constants';

const HighlightStepperTitleInput = () => {
  const { dispatch, stepperModal: { highlightTitle } } = useContext(ContentHighlightsContext);
  const [titleLength, setTitleLength] = useState(0);
  const [isInvalid, setIsInvalid] = useState(false);
  const handleChange = (e) => {
    // TODO: Eventually allow uniqueness of names validation based on existing highlight sets
    if (e.target.value.length > 60) {
      setIsInvalid(true);
    } else {
      setIsInvalid(false);
    }
    setTitleLength(e.target.value.length);
    dispatch(setStepperHighlightTitle({ highlightTitle: e.target.value }));
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
        {titleLength}/{HIGHLIGHT_TITLE_MAX_LENGTH}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default HighlightStepperTitleInput;

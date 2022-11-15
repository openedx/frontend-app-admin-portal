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
    <Form.Group isInvalid={isInvalid}>
      <Form.Control className="mb-2.5" data-testid="stepper-title-input" value={highlightTitle} onChange={handleChange} type="text" floatingLabel="Highlight collection name" />
      <Form.Label>{titleLength}/{HIGHLIGHT_TITLE_MAX_LENGTH} </Form.Label>
    </Form.Group>
  );
};

export default HighlightStepperTitleInput;
